document.getElementById("login").addEventListener("click",async function(e) {
    
    e.preventDefault()


    const username = document.getElementById("username").value
    const password = document.getElementById("password").value


    if (username !== "admin_cafemadan" ||   password !== "admin1234") {
        alert("شما اجازه دسترسی به این صفحه رو ندارید")
        return
    }
    else{
        alert("خوش آمدید")
        window.location.href = "/admin.html"
    }
})