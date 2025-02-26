from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pandas as pd
from dotenv import load_dotenv

from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("Groq_API")
HF_TOKEN = os.getenv("HF_TOKEN")
os.environ['HF_TOKEN'] = HF_TOKEN if HF_TOKEN else ""

def initialize_llm(api_key, retries=3):
    """Initialize Groq LLM with fallback to OpenAI."""
    for attempt in range(retries):
        try:
            return ChatGroq(groq_api_key=api_key, model="llama-3.3-70b-versatile")
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed to initialize Groq after {retries} attempts. Error: {str(e)}")
                openai_key = input("Enter OpenAI API key for fallback: ")
                if openai_key:
                    try:
                        return ChatOpenAI(api_key=openai_key)
                    except Exception as openai_error:
                        print(f"Failed to initialize OpenAI fallback. Error: {str(openai_error)}")
                        return None
    return None

# Initialize the LLM
llm = initialize_llm(GROQ_API_KEY)
if llm is None:
    raise Exception("Failed to initialize any language model")

# Load prompts from CSV
csv_file = "./prompts.csv"  # Ensure prompts.csv is in the same folder
df_prompts = pd.read_csv(csv_file)

def get_prompt_by_scenario(scenario_input: str):
    """
    Retrieve prompt details based on the provided scenario (or title fragment).
    Searches the 'Title' column for a case-insensitive match.
    """
    result = df_prompts[df_prompts['Title'].str.contains(scenario_input, case=False, na=False)]
    if not result.empty:
        row = result.iloc[0]
        return {
            'Title': row['Title'],
            'Scenario': row['Scenario'],
            'Example Conversation': row['Example Conversation'],
            'Keywords': row['Keywords']
        }
    else:
        return None

# Create FastAPI app instance
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Request and Response Models -----

class StartCallRequest(BaseModel):
    scenario: str

class StartCallResponse(BaseModel):
    context: str
    customerGreeting: str

@app.post("/api/start_call", response_model=StartCallResponse)
def start_call(request_data: StartCallRequest):
    scenario_input = request_data.scenario
    prompt_details = get_prompt_by_scenario(scenario_input)
    if prompt_details is None:
        raise HTTPException(status_code=404, detail=f"No prompt found for scenario '{scenario_input}'.")

    context = (
        f"Title: {prompt_details['Title']}\n"
        f"Scenario: {prompt_details['Scenario']}\n"
        f"Example Conversation: {prompt_details['Example Conversation']}\n"
        f"Keywords: {prompt_details['Keywords']}"
    ).strip()

    # Return the call context and an initial customer greeting.
    return StartCallResponse(context=context, customerGreeting="Hello")

class SendMessageRequest(BaseModel):
    message: str
    context: str
    chatHistory: str

class SendMessageResponse(BaseModel):
    response: str

@app.post("/api/send_message", response_model=SendMessageResponse)
def send_message(request_data: SendMessageRequest):
    user_message = request_data.message
    context = request_data.context
    chat_history = request_data.chatHistory

    system_prompt_template = """
You are an AI simulating a customer in a telecalling scenario.
Below is the prompt context for the scenario:
{context}
Conversation so far:
{chat_history}
Agent: {input}
Respond as the customer, maintaining consistency with the previous conversation and the scenario prompt.
Keep responses natural, concise, and realistic.
    """.strip()

    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt_template)
    ])
    # Compose the chain using the pipe operator.
    conversation_chain = chat_prompt | llm
    try:
        response_obj = conversation_chain.invoke({
            "input": user_message,
            "context": context,
            "chat_history": chat_history
        })
        response_text = response_obj.content if hasattr(response_obj, "content") else str(response_obj)
        return SendMessageResponse(response=response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----- Execution Process -----
if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI app with auto-reload enabled.
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
