
import { GoogleGenAI, Type } from "@google/genai";
import type { WorkflowStep } from '../types';

// The API key is injected from the environment. Do not edit this.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const workflowSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'O título conciso da etapa do workflow.',
      },
      description: {
        type: Type.STRING,
        description: 'Uma explicação detalhada do que precisa ser feito nesta etapa.',
      },
      status: {
        type: Type.STRING,
        description: 'O status inicial da tarefa, que deve ser sempre "A Fazer".',
      },
    },
    required: ['title', 'description', 'status'],
  },
};

interface RawWorkflowStep {
  title: string;
  description: string;
  status: 'A Fazer';
}

export const generateWorkflow = async (objectiveTitle: string, keyResultTitle: string): Promise<WorkflowStep[]> => {
  try {
    const prompt = `
      Você é um gestor de projetos sênior e especialista em estratégia.
      Baseado no Objetivo e no Resultado-Chave a seguir, gere um fluxo de trabalho (workflow) detalhado e acionável.
      O workflow deve consistir de 3 a 5 etapas claras que uma equipe pode seguir para atingir a meta.
      O status inicial de cada etapa deve ser "A Fazer".

      Objetivo: "${objectiveTitle}"
      Resultado-Chave: "${keyResultTitle}"

      Retorne o workflow como um array de objetos JSON, seguindo estritamente o schema fornecido.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: workflowSchema,
        thinkingConfig: { thinkingBudget: 0 } // faster response for this use case
      },
    });

    const jsonText = response.text;
    const parsedWorkflow: RawWorkflowStep[] = JSON.parse(jsonText);

    // Add unique IDs to each step for React keys
    return parsedWorkflow.map((step) => ({
      ...step,
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    }));
  } catch (error) {
    console.error('Error generating workflow:', error);
    // Provide a more user-friendly error message
    throw new Error('Não foi possível gerar o workflow. A IA pode estar sobrecarregada ou a requisição é inválida. Tente novamente mais tarde.');
  }
};
