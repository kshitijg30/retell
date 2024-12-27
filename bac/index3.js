const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = 8080;

const genAI = new GoogleGenerativeAI('AIzaSyAy3PmWVHdIBJc08IcY45SnLoABX-Jg_E8');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const api_key = process.env.api_key
console.log(api_key);
app.use(cors());
app.use(express.json());
app.post('/create-web-call', async (req, res) => {
    const { agent_id, metadata, retell_llm_dynamic_variables } = req.body;

    // Prepare the payload for the API request
    const payload = { agent_id };

    // Conditionally add optional fields if they are provided
    if (metadata) {
        payload.metadata = metadata;
    }

    if (retell_llm_dynamic_variables) {
        payload.retell_llm_dynamic_variables = retell_llm_dynamic_variables;
    }

    try {
        const response = await axios.post(
            'https://api.retellai.com/v2/create-web-call',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${api_key}`, // Replace with your actual Bearer token
                    'Content-Type': 'application/json',
                },
            }
        );
     //   console.log(response.data);
        const { call_id } = response.data.call_id; 
    
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error creating web call:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create web call' });
    }
});


app.get('/get-call/:callId', async (req, res) => {
    const { callId } = req.params;
    console.log("here?");
    console.log(callId);
    try {
        const response = await axios.get(
            `https://api.retellai.com/v2/get-call/${callId}`,
            {
                headers: {
                    'Authorization': `Bearer ${api_key}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("get call called");
        console.log(callId);
        const transcript = response.data.transcript;
        console.log(transcript);
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript not found in the call data' });
        }
        const summary = report.custom_analysis_data['_assessment summary'];
       
        //console.log(summary);
        // const complaintsPrompt = `The following text is a medical summary ${summary} of the patient. You have to find chief complaints in bullet points from the conversation.`;
        // const complaintsResponse = await model.generateContent([complaintsPrompt]);
        const complaints = report.custom_analysis_data['_chief _complaints'];

        // Process transcript directly using the generative model

        const prescriptionsPrompt = `The following text is a medical summary ${summary} of the patient. You have to prescribe medicines based on the summary. You have to prescribe medicines at any cost, you can use all medical data available on the web.`;
        const prescriptionsResponse = await model.generateContent([prescriptionsPrompt]);
        const prescriptions = prescriptionsResponse.response.text();
        console.log(prescriptions);
        const advicePrompt = `The following text is a medical summary ${summary} of the patient. You have to give medical advice only to the patient based on summary and prescriptions ${prescriptions}.`;
        const adviceResponse = await model.generateContent([advicePrompt]);
        const advice = adviceResponse.response.text();
        console.log(advice);
        // Return processed data directly
        res.status(200).json({
            chiefComplaints: complaints || "Not available",
            summary: summary || "Not available",
            prescriptions: prescriptions || "Not available",
            advice: advice || "Not available",
        });
    } catch (error) {
        console.error('Error processing call details:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process call details' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
