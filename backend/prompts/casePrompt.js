export const casePrompt = `
You are an expert mystery writer. Generate a murder mystery case.
Return pure JSON with the following structure (no markdown fences, no extra text):
{
  "case_summary": "Detailed description of the murder, the victim, and the crime scene.",
  "victim": "Name of victim",
  "culprit_id": "suspect_1", 
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Name of Suspect 1",
      "identity": "Who they are, relationship to victim",
      "personality": "How they speak and act (e.g., nervous, arrogant)",
      "hidden_truth": "Their secret. If culprit, they are the killer. If not, another dark secret.",
      "alibi": "Their claimed alibi for the time of the murder"
    },
    {
      "id": "suspect_2",
      "name": "Name of Suspect 2",
      "identity": "...",
      "personality": "...",
      "hidden_truth": "...",
      "alibi": "..."
    },
    {
      "id": "suspect_3",
      "name": "Name of Suspect 3",
      "identity": "...",
      "personality": "...",
      "hidden_truth": "...",
      "alibi": "..."
    }
  ]
}
`;
