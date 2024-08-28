const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const deleteButton = document.querySelector("#delete-btn");
const themeButton = document.querySelector("#theme-btn");

let userText = null;
const initialHeight = chatInput.scrollHeight;
const API_KEY = "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"

const loadDataFromLocalStorage = () => {
  const themeColor = localStorage.getItem("theme-color");
  document.body.classList.toggle("light-mode", themeColor !== "&#9788;");
  themeButton.innerHTML = document.body.classList.contains("light-mode")
    ? "&#9790;"
    : "&#9788;";

  const defaultText = ` <div class="default-text">
             <h1>Comic AI</h1>
             <p>Start a conversation and explore the power of AI. <br>Your chat history will be displayed here.</br></p>
             
             </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

loadDataFromLocalStorage();

const createElement = (html, className) => {
  const chatDiv = document.createElement("div")
  chatDiv.classList.add("chat", className)
  chatDiv.innerHTML = html;
  return chatDiv;
};

async function query(incomingChatDiv) {
  const pElement = document.createElement("p");

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: userText,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            top_p: 0.65,
            do_sample: true,
          },
        }),
      }
    );

    const result = await response.json();
    const text = result[0].generated_text;
    const lines = text.split("\n")

    const responseWithoutQuestion = lines
      .slice(1)
      .join("\n")
      .trim()
      .replace(/\n/g, "<br>");
    incomingChatDiv.querySelector(".typing-animation").remove();
    pElement.innerHTML = JSON.stringify(responseWithoutQuestion).trim();
  } catch (error) {
    incomingChatDiv.querySelector(".typing-animation").remove();
    pElement.classList.add("error");
    pElement.textContent = `${error}. Please try again later`
  }


  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.innerHTML = "&check;";
  setTimeout(() => (copyBtn.innerHTML = "&#10064;"), 1000);
};


const showTypingAnimation = () => {
  const html = `<div class="chat-content">
                <div class="chat-details">
                    <img src="./image/images.png" alt="chatbot">
                    <div class="typing-animation">
                      <div class="typing-dot" style="--delay:0.2s"></div>  
                      <div class="typing-dot" style="--delay:0.3s"></div> 
                      <div class="typing-dot" style="--delay:0.2s"></div> 
                    </div>
                </div>
                <span onclick="copyResponse(this)">&#10064;</span>
            </div>`;
  const incomingChatDiv = createElement(html, "incoming")
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollTo)
  query(incomingChatDiv);
}

const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (!userText) return;
  chatInput.value = "";
  chatInput.style.height = `${initialHeight}px`

  const html = `<div class="chat-content">
                <div class="chat-details">
                    <img src="./image/download.png" alt="user">
                    <p></p>
                </div>   
            </div>`;
  const outgoingChatDiv = createElement(html, "outgoing")
  outgoingChatDiv.querySelector("p").textContent = userText
  document.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv)
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
}



themeButton.addEventListener("click", () => {
  const moonEntity = "&#9790;";
  const sunEntity = "&#9788;";

  document.body.classList.toggle("light-mode")

  localStorage.setItem(
    "theme-color",
    document.body.classList.contains("light-mode") ? moonEntity : sunEntity
  );



  themeButton.innerHTML = document.body.classList.contains("light-mode")
    ? moonEntity
    : sunEntity;

});

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalStorage();
  }
})

chatInput.addEventListener("input", () => {

  chatInput.style.height = `${initialHeight}px`
  chatInput.style.height = `${chatInput.scrollHeight}px`
})
chatInput.addEventListener("input", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
})
sendButton.addEventListener("click", handleOutgoingChat);