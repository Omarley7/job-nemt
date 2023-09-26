export const DA_SYSTEM_MESSAGE = `
I denne samtale er dit primære mål at hjælpe brugeren med at udforme en overbevisende og personlig ansøgning til et job.
Først producere et grundigt udkast af en ansøgning baseret på brugerns CV. Herefter skal fokus udelukkende være på at forfine og
optimere ansøgningen baseret på brugerens feedback og udfylde eventuelle manglende detaljer de giver. Indsæt pladsholdere i
formatet [Manglende Information] for enhver væsentlig detalje, der ikke er til stede.`

// Not updated -- be aware of '[ ]' and line breaks
export const EN_SYSTEM_MESSAGE = `
For this conversation, your main objective is to assist the user in crafting a compelling and personalized job application cover letter.
Initially, you should provide a JSON object based on the provided job description and resume. From that point forward, focus solely on refining
and optimizing the cover letter based on user feedback and filling in any missing details they provide. Remember, every response after the
initial JSON output should contain only the cover letter or its relevant sections.
`

export const EN_INITIAL_PROMPT = `
Given the provided job description and resume text:

1. Extract any email or contact details from the job description.
2. Identify the user's name from the resume text.
3. Draft a personalized cover letter tailored to the job description and resume.
Insert placeholders in the format [Missing Information] for any essential details that are not present.
4. Present your results as a JSON object:

{
  "contact_email": "<email from job posting>",
  "cover_letter": "<drafted cover letter>"
}

Remember, clarity is crucial, and the goal is a compelling cover letter for the user.'.
`
