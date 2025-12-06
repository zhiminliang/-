import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Platform, AnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise executive summary of the log analysis in Chinese.",
    },
    overall_health_score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating the stability shown in the log (100 is perfect).",
    },
    device_info: {
      type: Type.STRING,
      description: "Extracted device model name if available.",
    },
    os_version: {
      type: Type.STRING,
      description: "Extracted OS version if available.",
    },
    app_version: {
      type: Type.STRING,
      description: "Extracted App version if available.",
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the issue in Chinese" },
          description: { type: Type.STRING, description: "Detailed description in Chinese" },
          severity: { 
            type: Type.STRING,
            enum: ["Critical", "High", "Medium", "Low", "Info"]
          },
          line_number: { type: Type.INTEGER },
          log_snippet: { type: Type.STRING },
          possible_cause: { type: Type.STRING, description: "Possible root cause analysis in Chinese" },
          recommendation: { type: Type.STRING, description: "Fix recommendation in Chinese" },
        },
        required: ["title", "description", "severity", "possible_cause", "recommendation"],
      },
    },
  },
  required: ["summary", "overall_health_score", "issues"],
};

export const analyzeLog = async (logContent: string, platform: Platform): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash"; // Using Flash for speed and efficiency with large text
  
  const platformContexts = {
    [Platform.IOS]: "关注 iOS 特有的信号: NSException, SIGSEGV, Jetsam events, Watchdog terminations, 以及 Swift/Obj-C 运行时错误。",
    [Platform.ANDROID]: "关注 Android 特有的信号: ANR, Fatal Exception, NullPointerException, Retrofit 网络错误, 以及 Activity 生命周期问题。",
    [Platform.MINI_PROGRAM]: "关注小程序 (微信/支付宝) 特性: JavaScript 报错, API 调用失败 (wx.request), 内存警告, 以及页面路由错误。"
  };

  const prompt = `
    你是一名资深的软件测试工程师(QA)和DevOps专家。
    请分析以下 ${platform} 平台的应用程序日志文件。
    ${platformContexts[platform]}
    
    请识别严重的崩溃(Critical)、性能瓶颈、警告和逻辑错误。
    
    **重要要求**：
    1. 所有返回的文本内容（标题、描述、原因、建议、总结）必须使用**简体中文**。
    2. 如果日志为空或无效，请在 summary 中说明。
    3. 针对每个问题，提供具体的代码级修复建议或测试排查方向。
    
    Log Content Truncated for Context (日志内容截取):
    ${logContent.slice(0, 30000)} 
  `;

  try {
    const response = await genAI.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for analytical precision
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI 未返回数据");
    }

    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("日志分析失败，请重试或检查日志内容。");
  }
};