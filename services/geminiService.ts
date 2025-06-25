import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MealSuggestion, DetailedMealRecipe, Ingredient, ExerciseSuggestion, SuggestExercisesParams, Gender, ActivityLevelName } from '../types';
import { ACTIVITY_LEVEL_OPTIONS } from '../constants'; // Import for activity level labels

// Ensure API_KEY is handled by the environment as per guidelines
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables. Meal suggestion, recipe detail, and exercise suggestion features will not work.");
}

// Initialize AI client only if API_KEY is available
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const parseJsonFromMarkdown = (markdownJson: string): any | null => {
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  let jsonStr = markdownJson.trim();

  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original string for parsing:", jsonStr);
    return null; 
  }
};

export const suggestMealsFromIngredients = async (ingredients: string): Promise<MealSuggestion[]> => {
  if (!ai) {
    throw new Error("خدمة الذكاء الاصطناعي غير مهيأة بسبب عدم توفر مفتاح API.");
  }
  const model = 'gemini-2.5-flash-preview-04-17';

  const prompt = `
أنت خبير تغذية وطاهٍ مبدع. بناءً على المكونات التالية المتوفرة لدي:
"${ingredients}"

اقترح علي ٣ وجبات صحية وسهلة التحضير يمكنني صنعها.
ركز على أن تكون الوجبات متوازنة ومغذية.
لكل وجبة مقترحة، يرجى تقديم:
1.  اسم الوجبة (mealName) باللغة العربية.
2.  وصف مختصر لطريقة التحضير (description) باللغة العربية.
3.  تقدير تقريبي للسعرات الحرارية (estimatedCalories) باللغة العربية، على سبيل المثال "حوالي ٣٥٠ سعرة حرارية".
4.  تقدير تقريبي للبروتين بالجرامات (proteinGrams) باللغة العربية، مثال: "حوالي ٢٥ جرام بروتين".
5.  تقدير تقريبي للكربوهيدرات بالجرامات (carbsGrams) باللغة العربية، مثال: "حوالي ٤٥ جرام كربوهيدرات".
6.  تقدير تقريبي للدهون بالجرامات (fatsGrams) باللغة العربية، مثال: "حوالي ١٥ جرام دهون".

يرجى تقديم الرد بصيغة JSON على شكل مصفوفة من الكائنات، حيث يمثل كل كائن وجبة. مثال للتنسيق المطلوب:
[
  {
    "mealName": "سلطة الكينوا بالخضار والدجاج",
    "description": "اسلق الكينوا. اخلطها مع قطع دجاج مشوي أو مسلوق، وخضروات مقطعة مثل الطماطم والخيار والفلفل. أضف تتبيلة ليمون وزيت زيتون.",
    "estimatedCalories": "حوالي ٤٠٠ سعرة حرارية",
    "proteinGrams": "حوالي ٣٠ جرام بروتين",
    "carbsGrams": "حوالي ٤٠ جرام كربوهيدرات",
    "fatsGrams": "حوالي ١٥ جرام دهون"
  }
]
تأكد أن الرد هو JSON صالح فقط، بدون أي نص إضافي قبله أو بعده.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const responseText = response.text;
    const parsedData = parseJsonFromMarkdown(responseText);

    if (parsedData && Array.isArray(parsedData)) {
      const validMeals = parsedData.filter(
        (item: any) => typeof item.mealName === 'string' && typeof item.description === 'string'
      );
      if (validMeals.length === 0 && parsedData.length > 0) {
        console.warn("Parsed data items do not match MealSuggestion structure", parsedData);
        throw new Error("الاقتراحات المستلمة ليست بالتنسيق المتوقع.");
      }
      return validMeals as MealSuggestion[];
    } else {
      console.error("Failed to parse meal suggestions or response is not an array:", parsedData, "Original AI response text:", responseText);
      throw new Error("لم يتمكن الذكاء الاصطناعي من تقديم اقتراحات بالتنسيق المتوقع.");
    }
  } catch (error) {
    console.error('Error calling Gemini API for meal suggestions:', error);
    if (error instanceof Error) {
        throw new Error(`خطأ في الاتصال بخدمة اقتراح الوجبات: ${error.message}`);
    }
    throw new Error('حدث خطأ غير متوقع أثناء اقتراح الوجبات.');
  }
};

export const getDetailedRecipe = async (mealName: string): Promise<Omit<DetailedMealRecipe, 'youtubeVideoId'>> => {
  if (!ai) {
    throw new Error("خدمة الذكاء الاصطناعي غير مهيأة بسبب عدم توفر مفتاح API.");
  }
  const model = 'gemini-2.5-flash-preview-04-17';
  const prompt = `
أنت مساعد طهي متخصص. بالنظر إلى اسم الوجبة التالي:
"${mealName}"

يرجى تقديم وصفة مفصلة لهذه الوجبة. يجب أن يتضمن الرد:
1.  اسم الوجبة (mealName) باللغة العربية (يجب أن يكون مطابقًا للاسم المعطى).
2.  قائمة المقادير (ingredients)، حيث يكون كل مقدار كائنًا يحتوي على:
    *   اسم المقدار (name) باللغة العربية.
    *   الكمية (quantity) باللغة العربية (مثال: "٢٠٠ جرام"، "١ حبة متوسطة"، "٣ ملاعق كبيرة").
3.  خطوات التحضير (preparationSteps) كقائمة من السلاسل النصية، كل سلسلة تمثل خطوة باللغة العربية.

يرجى تقديم الرد بصيغة JSON فقط. مثال للتنسيق المطلوب:
{
  "mealName": "${mealName}",
  "ingredients": [
    { "name": "صدور دجاج", "quantity": "٢ قطعة (حوالي ٤٠٠ جرام)" },
    { "name": "ليمون", "quantity": "١ حبة كبيرة" },
    { "name": "زيت زيتون", "quantity": "٢ ملعقة كبيرة" }
  ],
  "preparationSteps": [
    "سخّن الفرن إلى ٢٠٠ درجة مئوية.",
    "في وعاء صغير، اخلط عصير الليمون وزيت الزيتون.",
    "تبّل الدجاج بالخليط واخبزه."
  ]
}
تأكد أن الرد هو JSON صالح فقط، بدون أي نص إضافي قبله أو بعده.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    const responseText = response.text;
    const parsedData = parseJsonFromMarkdown(responseText);

    if (parsedData && 
        typeof parsedData.mealName === 'string' &&
        Array.isArray(parsedData.ingredients) &&
        parsedData.ingredients.every((ing: any) => typeof ing.name === 'string' && typeof ing.quantity === 'string') &&
        Array.isArray(parsedData.preparationSteps) &&
        parsedData.preparationSteps.every((step: any) => typeof step === 'string')
    ) {
      return parsedData as Omit<DetailedMealRecipe, 'youtubeVideoId'>;
    } else {
      console.error("Failed to parse detailed recipe or response structure is invalid:", parsedData, "Original AI response text:", responseText);
      throw new Error("لم يتمكن الذكاء الاصطناعي من تقديم تفاصيل الوصفة بالتنسيق المتوقع.");
    }
  } catch (error) {
    console.error('Error calling Gemini API for detailed recipe:', error);
    if (error instanceof Error) {
        throw new Error(`خطأ في جلب تفاصيل الوصفة: ${error.message}`);
    }
    throw new Error('حدث خطأ غير متوقع أثناء جلب تفاصيل الوصفة.');
  }
};

export const findRecipeVideo = async (mealName: string): Promise<{ youtubeVideoId: string | null }> => {
  if (!ai) {
    throw new Error("خدمة الذكاء الاصطناعي غير مهيأة بسبب عدم توفر مفتاح API.");
  }
  const model = 'gemini-2.5-flash-preview-04-17';
  const prompt = `
أنت مساعد بحث متخصص في إيجاد مقاطع فيديو للوصفات على يوتيوب. بالنظر إلى اسم الوجبة التالي:
"${mealName}"

ابحث عن فيديو تعليمي مناسب لهذه الوصفة على يوتيوب.
يرجى تقديم الرد بصيغة JSON يحتوي على معرّف الفيديو (youtubeVideoId). إذا لم يتم العثور على فيديو مناسب، يجب أن يكون معرّف الفيديو null.

مثال للتنسيق المطلوب إذا تم العثور على فيديو:
{
  "youtubeVideoId": "dQw4w9WgXcQ"
}

مثال للتنسيق المطلوب إذا لم يتم العثور على فيديو:
{
  "youtubeVideoId": null
}
تأكد أن الرد هو JSON صالح فقط، بدون أي نص إضافي قبله أو بعده.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    const responseText = response.text;
    const parsedData = parseJsonFromMarkdown(responseText);

    if (parsedData && (typeof parsedData.youtubeVideoId === 'string' || parsedData.youtubeVideoId === null)) {
      return parsedData as { youtubeVideoId: string | null };
    } else {
      console.error("Failed to parse YouTube video ID or response structure is invalid:", parsedData, "Original AI response text:", responseText);
      throw new Error("لم يتمكن الذكاء الاصطناعي من تقديم معرّف الفيديو بالتنسيق المتوقع.");
    }
  } catch (error) {
    console.error('Error calling Gemini API for YouTube video ID:', error);
    if (error instanceof Error) {
        throw new Error(`خطأ في البحث عن فيديو الوصفة: ${error.message}`);
    }
    throw new Error('حدث خطأ غير متوقع أثناء البحث عن فيديو الوصفة.');
  }
};

export const suggestExercises = async (params: SuggestExercisesParams): Promise<ExerciseSuggestion[]> => {
  if (!ai) {
    throw new Error("خدمة الذكاء الاصطناعي غير مهيأة بسبب عدم توفر مفتاح API.");
  }
  const model = 'gemini-2.5-flash-preview-04-17';

  const { tdee, gender, age, currentActivityLevel, exerciseGoal } = params;

  const genderArabic = gender === Gender.MALE ? 'ذكر' : 'أنثى';
  const activityLevelLabel = ACTIVITY_LEVEL_OPTIONS.find(opt => opt.value === currentActivityLevel)?.label || currentActivityLevel;
  
  let exerciseGoalArabic = '';
  switch (exerciseGoal) {
    case 'weightLoss': exerciseGoalArabic = 'فقدان الوزن'; break;
    case 'muscleGain': exerciseGoalArabic = 'بناء العضلات'; break;
    case 'generalFitness': exerciseGoalArabic = 'تحسين اللياقة العامة'; break;
    case 'endurance': exerciseGoalArabic = 'زيادة القدرة على التحمل'; break;
    default: exerciseGoalArabic = 'تحقيق الهدف المحدد';
  }

  const prompt = `
أنت مدرب لياقة بدنية وخبير في التمارين الرياضية. بناءً على البيانات التالية للمستخدم:
- الجنس: ${genderArabic}
- العمر: ${age} سنة
- إجمالي إنفاق الطاقة اليومي (TDEE) المقدر: ${Math.round(tdee)} سعرة حرارية/يوم
- مستوى النشاط العام الحالي: "${activityLevelLabel}"
- الهدف الأساسي من التمرين: "${exerciseGoalArabic}"

يرجى اقتراح ٣ إلى ٥ تمارين رياضية متنوعة ومناسبة. يجب أن تكون الاقتراحات واقعية ويمكن تنفيذها.
لكل تمرين مقترح، قدم المعلومات التالية:
1.  اسم التمرين (exerciseName) باللغة العربية.
2.  وصف مختصر للتمرين أو إرشادات أساسية (description) باللغة العربية.
3.  المدة المقترحة للتمرين (duration)، مثال: "٣٠ دقيقة" أو "٣ مجموعات × ١٢ تكرار".
4.  مستوى الشدة المقترح (intensity)، مثال: "منخفضة"، "متوسطة"، "عالية".
5.  تقدير تقريبي للسعرات الحرارية المحروقة (estimatedCaloriesBurned) إذا أمكن، مثال: "حوالي ١٥٠-٢٥٠ سعرة حرارية". (اذكر أن هذا تقديري ويعتمد على عوامل كثيرة)
6.  ابحث عن رابط URL لصورة متحركة (GIF) توضيحية **عامة ومتاحة للعموم (publicly accessible)** لكيفية أداء التمرين (animationUrl). يجب أن تكون الصورة المتحركة واضحة وذات صلة مباشرة بالتمرين. إذا لم تتمكن من العثور على GIF مناسب، اجعل قيمة animationUrl هي null. **تجنب مقاطع الفيديو الطويلة أو التي تتطلب اشتراكًا.**

يرجى تقديم الرد بصيغة JSON على شكل مصفوفة من الكائنات، حيث يمثل كل كائن تمرينًا. مثال للتنسيق المطلوب:
[
  {
    "exerciseName": "المشي السريع",
    "description": "المشي بخطى سريعة ومتواصلة في الخارج أو على جهاز المشي.",
    "duration": "٣٠-٤٥ دقيقة",
    "intensity": "متوسطة",
    "estimatedCaloriesBurned": "حوالي ٢٠٠-٣٠٠ سعرة حرارية",
    "animationUrl": "https://example.com/walking.gif"
  },
  {
    "exerciseName": "تمارين الضغط (Push-ups)",
    "description": "تمرين لتقوية الجزء العلوي من الجسم والصدر، يمكن تعديله حسب مستوى اللياقة.",
    "duration": "٣ مجموعات، أقصى عدد ممكن من التكرارات",
    "intensity": "متوسطة إلى عالية",
    "estimatedCaloriesBurned": "حوالي ١٠٠-١٥٠ سعرة حرارية لكل ١٥ دقيقة",
    "animationUrl": null
  }
]
تأكد أن الرد هو JSON صالح فقط، بدون أي نص إضافي قبله أو بعده.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const responseText = response.text;
    const parsedData = parseJsonFromMarkdown(responseText);

    if (parsedData && Array.isArray(parsedData)) {
      const validExercises = parsedData.filter(
        (item: any) => typeof item.exerciseName === 'string' && typeof item.description === 'string'
      );
      if (validExercises.length === 0 && parsedData.length > 0) {
        console.warn("Parsed exercise data items do not match ExerciseSuggestion structure", parsedData);
        throw new Error("اقتراحات التمارين المستلمة ليست بالتنسيق المتوقع.");
      }
      // Ensure animationUrl is either string or null
      return validExercises.map(ex => ({
        ...ex,
        animationUrl: (typeof ex.animationUrl === 'string' && ex.animationUrl.trim() !== '') ? ex.animationUrl.trim() : null,
      })) as ExerciseSuggestion[];
    } else {
      console.error("Failed to parse exercise suggestions or response is not an array:", parsedData, "Original AI response text:", responseText);
      throw new Error("لم يتمكن الذكاء الاصطناعي من تقديم اقتراحات تمارين بالتنسيق المتوقع.");
    }
  } catch (error) {
    console.error('Error calling Gemini API for exercise suggestions:', error);
    if (error instanceof Error) {
        throw new Error(`خطأ في الاتصال بخدمة اقتراح التمارين: ${error.message}`);
    }
    throw new Error('حدث خطأ غير متوقع أثناء اقتراح التمارين.');
  }
};