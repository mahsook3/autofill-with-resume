const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class AutofillWithResume {
  constructor(apiKey, filePath) {
    this.apiKey = apiKey;
    this.filePath = filePath;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async extractResumeDetails() {
    try {
      const dataBuffer = fs.readFileSync(this.filePath);
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text.trim().replace(/"/g, '\\"');

      const prompt = `
      Extract the following details from the provided paragraph: name, website, email, phone number, LinkedIn, GitHub, Twitter (X), Facebook, education, skills, experience, projects, certifications, and achievements.
      Please return **only** a valid JSON object without any extra text or comments.
      The result should be in the following JSON structure:
      {
        "personalDetails": {
          "name": "Full name extracted from the paragraph",
          "website": "Website extracted from the paragraph",
          "email": "Email address extracted from the paragraph",
          "phone": "Phone number extracted from the paragraph",
          "social_media": {
            "linkedin": "LinkedIn profile extracted from the paragraph",
            "github": "GitHub profile extracted from the paragraph",
            "twitter": "Twitter profile extracted from the paragraph",
            "facebook": "Facebook profile extracted from the paragraph",
            "...": "..."
          }
        },
        "education": [
          {
            "course": "Course name extracted from the paragraph",
            "institute": "Institute name extracted from the paragraph",
            "board_university": "Board/University name extracted from the paragraph",
            "score": "Score extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          },
          {
            "course": "Course name extracted from the paragraph",
            "institute": "Institute name extracted from the paragraph",
            "board_university": "Board/University name extracted from the paragraph",
            "score": "Score extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          },
          {
            "course": "Course name extracted from the paragraph",
            "institute": "Institute name extracted from the paragraph",
            "board_university": "Board/University name extracted from the paragraph",
            "score": "Score extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          }
        ],
        "skills": ["Skill 1", "Skill 2", "Skill 3", "..."],
        "experience": [
          {
            "title": "Job title extracted from the paragraph",
            "company": "Company name extracted from the paragraph",
            "duration": "Duration extracted from the paragraph",
            "description": "Job description extracted from the paragraph",
            "location": "Company Location extracted from the paragraph"
          },
          {
            "title": "Job title extracted from the paragraph",
            "company": "Company name extracted from the paragraph",
            "duration": "Duration extracted from the paragraph",
            "description": "Job description extracted from the paragraph",
            "location": "Company Location extracted from the paragraph"
          },
          {
            "title": "Job title extracted from the paragraph",
            "company": "Company name extracted from the paragraph",
            "duration": "Duration extracted from the paragraph",
            "description": "Job description extracted from the paragraph",
            "location": "Company Location extracted from the paragraph"
          },
          "..."
        ],
        "projects": [
          {
            "name": "Project name extracted from the paragraph",
            "technologies": ["Technology 1 extracted from the paragraph", "Technology 2 extracted from the paragraph", "Technology 3 extracted from the paragraph"],
            "description": "Project description extracted from the paragraph",
            "link": "Project link extracted from the paragraph"
          },
          {
            "name": "Project name extracted from the paragraph",
            "technologies": ["Technology 1 extracted from the paragraph", "Technology 2 extracted from the paragraph", "Technology 3 extracted from the paragraph"],
            "description": "Project description extracted from the paragraph",
            "link": "Project link extracted from the paragraph"
          },
          "..."
        ],
        "certifications": [
          {
            "name": "Certification name extracted from the paragraph",
            "platform": "Platform name extracted from the paragraph",
            "year": "Year extracted from the paragraph",
            "link": "Certification link extracted from the paragraph"
          },
          {
            "name": "Certification name extracted from the paragraph",
            "platform": "Platform name extracted from the paragraph",
            "year": "Year extracted from the paragraph",
            "link": "Certification link extracted from the paragraph"
          },
          "..."
        ],
        "achievements": [
          {
            "title": "Achievement title extracted from the paragraph",
            "competition": "Competition name extracted from the paragraph",
            "prize": "Prize extracted from the paragraph",
            "organization": "Organization name extracted from the paragraph",
            "location": "Location extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          },
          {
            "title": "Achievement title extracted from the paragraph",
            "competition": "Competition name extracted from the paragraph",
            "prize": "Prize extracted from the paragraph",
            "organization": "Organization name extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          },
          {
            "title": "Achievement title extracted from the paragraph",
            "competition": "Competition name extracted from the paragraph",
            "organization": "Organization name extracted from the paragraph",
            "year": "Year extracted from the paragraph"
          },
          "..."
        ]
      }
      Paragraph: ${extractedText}
    `;

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = await response.text();

      if (!generatedText) {
        throw new Error("Empty response from API.");
      }

      const cleanText = generatedText
      .replace(/```json/g, "") 
      .replace(/```/g, "")   
      .replace(/\\n/g, "")     
      // .replace(/\\/g, "")     
      .replace(/^JSON/, "")    
      .trim(); 

      if (!cleanText.endsWith("}")) {
        throw new Error("Incomplete JSON response.");
      }

      let details;
      try {
        details = JSON.parse(cleanText);
      } catch (error) {
        console.error("Error parsing JSON:", error, "Generated text:", cleanText);
        throw new Error("Error parsing generated JSON");
      }

      return details;

    } catch (error) {
      console.error("Error extracting resume details:", error);
      throw new Error("Failed to extract resume details.");
    }
  }
}

module.exports = AutofillWithResume;
