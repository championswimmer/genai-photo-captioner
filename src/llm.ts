import OpenAI from 'openai' 
import { ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from 'openai/resources'
import { Photo } from 'types'

export const Providers = {
  OpenAI: new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  }),
  Anthropic: new OpenAI({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: "https://api.anthropic.com/v1/"
  }),
  xAI: new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1"
  })
}

export const Models = {
  OpenAI: {
    GPT4o: "gpt-4o",
  },
  Anthropic: {
    Claude35Sonnet: "claude-3-5-sonnet-latest",
    Claude37Sonnet: "claude-3-7-sonnet-latest",
  },
  xAI: {
    Grok2Vision: "grok-2-vision-latest",
  }
}

export const SystemMessage: ChatCompletionSystemMessageParam = {
  role: "system",
  content: `
    You are a social media expert who knows how to give catchy captions to posts including photos.
    The images uploaded to you are followed by their EXIF data.
    Do **NOT** print the exact latiatude/longitude data in the captions.
    If GPS data is present you **MUST** include a story about the city and country of the location.
    Generate only a single caption for the entire set of photos.
    The caption can be between 100-200 words long.
  `,
}

export function generatePhotoAttachments(photos: Photo[]): ChatCompletionMessageParam {
  return ({
    role: "user",
    content: photos.map((photo) => ([
      <ChatCompletionContentPartImage>{
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${photo.base64}`,
          detail: "low"
        }
      },
      <ChatCompletionContentPartText>{
        type: "text",
        text: `EXIF Data: ${JSON.stringify(photo.exif)}`
      }
    ])).flat()
  })
}

export { Providers, Models, SystemMessage, generatePhotoAttachments }
