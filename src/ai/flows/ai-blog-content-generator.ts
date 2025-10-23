
'use server';
/**
 * @fileOverview AI-powered blog content generator for suggesting related content and generating relevant paragraphs.
 *
 * - generateBlogContent - A function that generates blog content based on a topic and optional keywords.
 * - GenerateBlogContentInput - The input type for the generateBlogContent function.
 * - GenerateBlogContentOutput - The return type for the generateBlogContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogContentInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  keywords: z.string().optional().describe('Optional keywords to focus the content generation.'),
});
export type GenerateBlogContentInput = z.infer<typeof GenerateBlogContentInputSchema>;

const GenerateBlogContentOutputSchema = z.object({
  suggestedContent: z.string().describe('Suggestions for related content to include in the blog post.'),
  generatedParagraphs: z.string().describe('AI-generated paragraphs relevant to the topic and keywords.'),
});
export type GenerateBlogContentOutput = z.infer<typeof GenerateBlogContentOutputSchema>;

export async function generateBlogContent(input: GenerateBlogContentInput): Promise<GenerateBlogContentOutput> {
  return generateBlogContentFlow(input);
}

const generateBlogContentPrompt = ai.definePrompt({
  name: 'generateBlogContentPrompt',
  input: {schema: GenerateBlogContentInputSchema},
  output: {schema: GenerateBlogContentOutputSchema},
  prompt: `You are a helpful AI assistant for blog content creators.

  Your task is to suggest related content and generate relevant paragraphs for a blog post based on the given topic and keywords.

  Topic: {{{topic}}}
  Keywords: {{{keywords}}}

  Instructions:
  1. Suggest related content ideas that would be valuable to include in the blog post.
  2. Generate a few paragraphs that provide insightful and engaging content related to the topic and keywords.
  3. Use a tone that is informative, engaging, and optimized for online readers.

  Output the suggestions and generated paragraphs in a clear and concise manner.
  `,
});

const generateBlogContentFlow = ai.defineFlow(
  {
    name: 'generateBlogContentFlow',
    inputSchema: GenerateBlogContentInputSchema,
    outputSchema: GenerateBlogContentOutputSchema,
  },
  async input => {
    const {output} = await generateBlogContentPrompt(input);
    return output!;
  }
);
