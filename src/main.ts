import { generatePhotoAttachments, Models, Providers, SystemMessage } from "llm";
import { ChatCompletion, ChatCompletionChunk } from "openai/resources/chat/completions";
import { Stream } from "openai/streaming";
import { getPhotosFromFolder } from "node/photos.node";

const PHOTO_FOLDER = "/Users/championswimmer/Pictures/LLM_Photos/Italy_Buildings"
const STREAMING = true
async function main() {

  const photos = await getPhotosFromFolder(PHOTO_FOLDER, 300)
  const photoAttachments = generatePhotoAttachments(photos)

  const llm = Providers.Anthropic
  const stream = await llm.chat.completions.create({
    model: Models.Anthropic.Claude35Sonnet,
    stream: STREAMING,
    max_tokens: 500,
    temperature: 0.8,
    messages: [
      SystemMessage,
      photoAttachments
    ]
  })

  if (stream instanceof Stream) {
    for await (const chunk of (stream as Stream<ChatCompletionChunk>)) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      process.stdout.write(content);
    }
  } else {
    const completion = (stream as ChatCompletion).choices[0]?.message?.content || '';
    console.log(completion);
  }

}

main().catch(console.error);