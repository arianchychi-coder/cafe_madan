
document.getElementById("registerform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = this;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = form.querySelector("input[name='name']").value;
    const phone = form.querySelector("input[name='phone']").value;
    const role = form.querySelector("select[name='role']").value;
    const companyname = form.querySelector("input[name='companyname']").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                phone,
                role,
                companyname
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "خطا در ثبت اطلاعات");
            return;
        }

        alert(data.message);
        form.reset();

    } catch (error) {
        console.error("Error:", error);
        alert("خطا در ارتباط با سرور");
    }
});




const rolePicker = document.getElementById("role-picker");
const roleSelect = document.getElementById("role");
const roleOptions = document.getElementById("role-options");
const roleChevron = rolePicker.querySelector(".role-chevron");

function renderRoleOptions() {
    roleOptions.replaceChildren();

    [...roleSelect.options].forEach((option, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "custom-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(roleSelect.selectedIndex === index));

        if (option.disabled) {
            item.classList.add("disabled");
            item.disabled = true;
        }

        if (roleSelect.selectedIndex === index) {
            item.classList.add("selected");
        }

        const text = document.createElement("span");
        text.textContent = option.textContent;

        const check = document.createElement("span");
        check.className = "option-check";
        check.textContent = "✓";
        check.setAttribute("aria-hidden", "true");

        item.append(text, check);

        item.addEventListener("click", () => {
            roleSelect.selectedIndex = index;

            // اجرای اعتبارسنجی و اطلاع‌رسانی به listenerها
            roleSelect.dispatchEvent(new Event("change", { bubbles: true }));

            renderRoleOptions();
            closeRoleOptions();
        });

        roleOptions.appendChild(item);
    });
}

function openRoleOptions() {
    renderRoleOptions();
    roleOptions.hidden = false;
    roleChevron?.classList.add("is-open");
}

function closeRoleOptions() {
    roleOptions.hidden = true;
    roleChevron?.classList.remove("is-open");
}

roleSelect.addEventListener("mousedown", (e) => {
    // جلوگیری از باز شدن منوی بومی مرورگر
    e.preventDefault();
    if (roleOptions.hidden) {
        openRoleOptions();
    } else {
        closeRoleOptions();
    }
});

roleSelect.addEventListener("keydown", (e) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        openRoleOptions();
        roleOptions.querySelector(".custom-option:not(:disabled)")?.focus();
    }

    if (e.key === "Escape") {
        closeRoleOptions();
    }
});

roleOptions.addEventListener("keydown", (e) => {
    const items = [...roleOptions.querySelectorAll(".custom-option:not(:disabled)")];
    const index = items.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Escape") {
        closeRoleOptions();
        roleSelect.focus();
    }
});

document.addEventListener("click", (e) => {
    if (!rolePicker.contains(e.target)) {
        closeRoleOptions();
    }
});

roleSelect.addEventListener("change", renderRoleOptions);

renderRoleOptions();
