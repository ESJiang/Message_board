function judegeContinue(target) {
    const judgeDelete = prompt(`Hi ${target.previousElementSibling.previousElementSibling.textContent}! Are you sure to delete "${target.previousElementSibling.textContent}" ? Y/N`);
    if (judgeDelete === null || !(judgeDelete.toLowerCase() === "y")) return false;
    return true;
}

// 删除msg
async function handleDelete() {
    try {
        if (!judegeContinue(this)) return;
        const response = await axios.delete(`http://localhost:8080/messages/${this.getAttribute("data-id")}`);
        response.status === 201 ? getMessages() : null;
    } catch (error) {
        console.error("Error deleting message:", error);
    }
}

//更新msg
async function handleUpdate() {
    document.querySelectorAll("li button:last-of-type").forEach(item => {
        item.disabled = true;
        item.className = "button_disabled";
    });
    const field = document.createElement("section");
    const message_list = document.getElementById("message-list");
    const name = this.closest("li").querySelector("b").textContent;
    field.innerHTML = `
    <label for='comment'>Hi <b>${name}</b>! Please update your comment</label>
    <input type='text' id='comment' name='comment' placeholder='Comment'/>
    <button class="update-button">Finish edit</button>`;
    message_list.appendChild(field);
    field.querySelector(".update-button").addEventListener("click", async () => {
        const comment = field.querySelector("#comment").value;
        if (!comment) {
            alert(`Hi ${name}! Your updated comment is empty`);
            return;
        }
        try {
            const response = await axios.put(
                `http://localhost:8080/messages/${this.getAttribute("data-id")}`,
                { name: name, message: comment },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            message_list.removeChild(field);
            response.status === 201 ? getMessages() : null;
        } catch (error) {
            console.error("Error updating message:", error);
        }
    });
}

// display messages
async function getMessages() {
    try {
        const response = await axios.get("http://localhost:8080/messages");
        const messages = response.data;
        const messageList = document.getElementById("message-list");
        messageList.innerHTML = "";
        messages.forEach(message => {
            const messageItem = document.createElement("li");
            messageItem.innerHTML = `
            <b>${message.name}</b>
            <span>${message.message}</span>
            <button class="delete-button" data-id="${message.id}">Delete</button>
            <button class="update-button" data-id="${message.id}">Update</button>`;
            messageList.appendChild(messageItem);
        });
        document.querySelectorAll(".delete-button").forEach(item => item.addEventListener("click", handleDelete));
        document.querySelectorAll(".update-button").forEach(item => item.addEventListener("click", handleUpdate));
    } catch (error) {
        console.error("Error displaying message:", error);
    }
}

// post message
async function handleSubmitMessage(e) {
    e.preventDefault();
    try {
        const response = await axios.post(
            "http://localhost:8080/messages",
            {
                name: this.children[0].value,
                message: this.children[1].value,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.status === 201) {
            getMessages();
            this.children[0].value = "";
            this.children[1].value = "";
        }
    } catch (error) {
        console.error("Error occurred while submitting message:", error);
    }
}
getMessages();
document.getElementById("message-form").addEventListener("submit", handleSubmitMessage);
