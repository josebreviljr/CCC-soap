# SOAP Note Refiner

A React-based web application that helps physicians improve their medical documentation by providing AI-powered analysis of SOAP notes with automatic PHI anonymization.

## Features

### 🔒 Privacy & Security
- **Automatic PHI Anonymization**: Removes names, dates, addresses, phone numbers, IDs, and email addresses before AI analysis
- **Local Storage**: All data is stored locally in your browser
- **Environment Variables**: API keys are stored securely in environment variables
- **HIPAA-Conscious Design**: Built with healthcare privacy requirements in mind

### 🩺 Medical Documentation Analysis
- **Multiple AI Providers**: Choose between OpenAI GPT-4 or Google Gemini for SOAP note analysis
- **AI-Powered Review**: Analyzes SOAP notes for completeness, clarity, and accuracy
- **Comprehensive Feedback**: Provides specific suggestions for improvement across all SOAP sections
- **Medical Terminology**: Checks for proper medical terminology and abbreviations
- **Billing Compliance**: Considers documentation requirements for billing and liability

### 📁 File Handling
- **Multiple Input Methods**: Text input, file upload, or drag-and-drop
- **File Format Support**: .txt, .doc, .docx files
- **Conversation History**: Tracks all analyses with timestamps
- **Export Functionality**: Export conversations as JSON or text files

### ⚙️ Customization
- **AI Provider Selection**: Choose between OpenAI or Google Gemini
- **Configurable Anonymization**: Toggle different types of PHI removal
- **Model Selection**: 
  - OpenAI: GPT-3.5 Turbo (default), GPT-4, or GPT-4 Turbo
  - Gemini: Gemini 1.5 Pro, Gemini 1.5 Flash, or Gemini Pro
- **Custom API Endpoints**: Support for custom OpenAI API base URLs
- **Persistent Settings**: Settings are saved locally for convenience

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- API key for your chosen provider:
  - OpenAI API key (from [OpenAI Platform](https://platform.openai.com/api-keys))
  - Google Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd soap-note-refiner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.template .env
```

4. Edit the `.env` file and add your API key(s):
```env
# For OpenAI
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# For Google Gemini  
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server:
```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
```

## Usage

1. **Configure API**: Click the Settings button, choose your AI provider, and enter your API key
2. **Submit SOAP Note**: Either paste text or upload a file containing your SOAP note
3. **Review Analysis**: The AI will provide detailed feedback on your documentation
4. **View History**: Access previous analyses in the conversation history
5. **Export Data**: Export your conversation history for record-keeping

## Privacy Features

### Automatic Anonymization
The application automatically removes:
- **Names**: Patient names, physician names, family member names
- **Dates**: Specific dates and timestamps
- **Addresses**: Street addresses, cities, zip codes
- **Phone Numbers**: Phone and fax numbers
- **ID Numbers**: MRN, SSN, insurance IDs
- **Email Addresses**: All email addresses

### Data Storage
- All data is stored locally in your browser
- No data is sent to external servers except anonymized content to OpenAI
- Settings and conversation history persist between sessions
- Clear data anytime with the built-in clear function

## Technical Details

### Built With
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **OpenAI API** and **Google Gemini API** for AI analysis
- **React Dropzone** for file uploads

### Project Structure
```
src/
├── components/           # React components
│   ├── ConversationHistory.tsx
│   ├── SettingsPanel.tsx
│   └── SoapNoteInput.tsx
├── services/            # API services
│   ├── openai.ts
│   └── gemini.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── anonymization.ts
│   └── export.ts
└── App.tsx             # Main application component
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is designed to assist with medical documentation but should not replace professional medical judgment. Always review AI suggestions carefully and ensure compliance with your organization's documentation standards and regulatory requirements.

## Support

For issues or questions:
1. Check the existing GitHub issues
2. Create a new issue with detailed information
3. Include error messages and browser console logs when applicable