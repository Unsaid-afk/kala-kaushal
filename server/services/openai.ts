import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key" 
});

export interface VideoAnalysisResult {
  performanceScore: number;
  metrics: {
    name: string;
    value: number;
    unit: string;
    confidence: number;
  }[];
  feedback: string;
  formAnalysis: {
    overallForm: number;
    improvements: string[];
    strengths: string[];
  };
  detectedMovements: string[];
  riskFactors: string[];
}

export interface PoseAnalysisResult {
  jointAngles: Record<string, number>;
  bodyPosture: string;
  movementQuality: number;
  technicalFeedback: string[];
}

export interface AthleteInsights {
  overallAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  potentialRating: number;
  improvementAreas: {
    area: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
  }[];
  comparisonToPeers: {
    percentile: number;
    description: string;
  };
}

export class VideoAnalysisService {
  /**
   * Analyze sports performance video using OpenAI's vision capabilities
   */
  async analyzePerformanceVideo(
    base64Video: string, 
    testType: string,
    athleteMetadata?: { age?: number; height?: number; weight?: number; sport?: string }
  ): Promise<VideoAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(testType, athleteMetadata);

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert sports performance analyst with computer vision capabilities. Analyze athletic movements with precision and provide actionable feedback."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:video/mp4;base64,${base64Video}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        performanceScore: Math.max(0, Math.min(100, analysisResult.performanceScore || 0)),
        metrics: analysisResult.metrics || [],
        feedback: analysisResult.feedback || "Analysis completed",
        formAnalysis: {
          overallForm: Math.max(0, Math.min(100, analysisResult.formAnalysis?.overallForm || 0)),
          improvements: analysisResult.formAnalysis?.improvements || [],
          strengths: analysisResult.formAnalysis?.strengths || [],
        },
        detectedMovements: analysisResult.detectedMovements || [],
        riskFactors: analysisResult.riskFactors || [],
      };
    } catch (error) {
      console.error("Video analysis failed:", error);
      throw new Error("Failed to analyze video: " + (error as Error).message);
    }
  }

  /**
   * Analyze pose and biomechanics from a single frame
   */
  async analyzePoseFromFrame(base64Image: string, exerciseType: string): Promise<PoseAnalysisResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a biomechanics expert. Analyze body posture, joint angles, and movement quality from sports images."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze the athlete's pose and biomechanics in this ${exerciseType} image. Focus on joint angles, body alignment, and form quality. Provide specific technical feedback and measurements where possible. Respond in JSON format with: {"jointAngles": {}, "bodyPosture": "", "movementQuality": 0-100, "technicalFeedback": []}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        jointAngles: result.jointAngles || {},
        bodyPosture: result.bodyPosture || "Unable to analyze posture",
        movementQuality: Math.max(0, Math.min(100, result.movementQuality || 0)),
        technicalFeedback: result.technicalFeedback || [],
      };
    } catch (error) {
      console.error("Pose analysis failed:", error);
      throw new Error("Failed to analyze pose: " + (error as Error).message);
    }
  }

  /**
   * Generate comprehensive AI insights for an athlete
   */
  async generateAthleteInsights(
    athleteData: any,
    assessments: any[],
    performanceMetrics: any[]
  ): Promise<AthleteInsights> {
    try {
      const prompt = `
        Analyze this athlete's complete profile and generate comprehensive insights:
        
        Athlete Profile: ${JSON.stringify(athleteData)}
        Assessments: ${JSON.stringify(assessments)}
        Performance Metrics: ${JSON.stringify(performanceMetrics)}
        
        Provide a detailed analysis including overall assessment, strengths, weaknesses, 
        specific recommendations, potential rating out of 10, improvement areas with priorities,
        and comparison to peer athletes in their sport/age group.
        
        Format response as JSON: {
          "overallAnalysis": "string",
          "strengths": ["string"],
          "weaknesses": ["string"], 
          "recommendations": ["string"],
          "potentialRating": number,
          "improvementAreas": [{"area": "string", "priority": "high|medium|low", "recommendation": "string"}],
          "comparisonToPeers": {"percentile": number, "description": "string"}
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert sports scientist and talent scout with deep knowledge of athletic development. Provide insightful, data-driven analysis that helps identify potential and development opportunities."
          },
          {
            role: "user",
            content: prompt
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        overallAnalysis: result.overallAnalysis || "Analysis completed",
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        recommendations: result.recommendations || [],
        potentialRating: Math.max(0, Math.min(10, result.potentialRating || 0)),
        improvementAreas: result.improvementAreas || [],
        comparisonToPeers: {
          percentile: Math.max(0, Math.min(100, result.comparisonToPeers?.percentile || 50)),
          description: result.comparisonToPeers?.description || "Comparison data limited"
        }
      };
    } catch (error) {
      console.error("AI insights generation failed:", error);
      throw new Error("Failed to generate AI insights: " + (error as Error).message);
    }
  }

  /**
   * Generate personalized training recommendations
   */
  async generateTrainingRecommendations(
    athleteData: any,
    recentAssessments: any[],
    goals: string[]
  ): Promise<{ recommendations: string[]; exercises: any[]; timeline: string }> {
    try {
      const prompt = `
        Based on the following athlete data and assessment history, generate personalized training recommendations:
        
        Athlete Profile: ${JSON.stringify(athleteData)}
        Recent Assessments: ${JSON.stringify(recentAssessments)}
        Goals: ${goals.join(', ')}
        
        Provide specific, actionable training recommendations, exercise suggestions, and a timeline.
        Format response as JSON: {"recommendations": [], "exercises": [], "timeline": ""}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a certified sports trainer and performance coach. Create evidence-based training plans."
          },
          {
            role: "user",
            content: prompt
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        recommendations: result.recommendations || [],
        exercises: result.exercises || [],
        timeline: result.timeline || "4-6 weeks",
      };
    } catch (error) {
      console.error("Training recommendation generation failed:", error);
      throw new Error("Failed to generate recommendations: " + (error as Error).message);
    }
  }

  /**
   * Build analysis prompt based on test type
   */
  private buildAnalysisPrompt(testType: string, metadata?: any): string {
    const basePrompt = `Analyze this ${testType} performance video and provide detailed assessment.`;
    
    const testSpecificInstructions = {
      'sprint': 'Focus on running form, acceleration, stride length, and speed consistency. Measure approximate speed if possible.',
      'vertical_jump': 'Analyze jump height, takeoff technique, body positioning, and landing form. Estimate jump height in centimeters.',
      'agility': 'Assess change of direction speed, body control, footwork, and movement efficiency.',
      'strength': 'Evaluate form, range of motion, control, and execution quality.',
      'endurance': 'Monitor consistency, pacing, form degradation, and cardiovascular efficiency.',
    };

    const specificInstructions = testSpecificInstructions[testType as keyof typeof testSpecificInstructions] || 
      'Analyze the athletic movement and provide performance insights.';

    const metadataContext = metadata ? 
      `Consider athlete context: age ${metadata.age}, height ${metadata.height}cm, weight ${metadata.weight}kg, sport: ${metadata.sport}.` : '';

    return `${basePrompt} ${specificInstructions} ${metadataContext}
    
    Respond in JSON format with:
    {
      "performanceScore": 0-100,
      "metrics": [{"name": "", "value": 0, "unit": "", "confidence": 0-1}],
      "feedback": "detailed feedback text",
      "formAnalysis": {
        "overallForm": 0-100,
        "improvements": ["list of areas to improve"],
        "strengths": ["list of strengths observed"]
      },
      "detectedMovements": ["list of movements identified"],
      "riskFactors": ["potential injury risks or form issues"]
    }`;
  }

  /**
   * Validate video integrity and detect potential manipulation
   */
  async validateVideoIntegrity(base64Video: string): Promise<{ isValid: boolean; confidence: number; issues: string[] }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a digital forensics expert. Detect signs of video manipulation, editing, or artificial enhancement."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this video for signs of digital manipulation, speed alteration, deepfakes, or other editing. Look for inconsistencies in lighting, motion blur, frame rates, or unnatural movements. Respond in JSON: {\"isValid\": boolean, \"confidence\": 0-1, \"issues\": []}"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:video/mp4;base64,${base64Video}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        isValid: result.isValid ?? true,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
        issues: result.issues || [],
      };
    } catch (error) {
      console.error("Video integrity validation failed:", error);
      // Default to valid if analysis fails
      return {
        isValid: true,
        confidence: 0.5,
        issues: ["Unable to validate video integrity"]
      };
    }
  }
}

export const videoAnalysisService = new VideoAnalysisService();
