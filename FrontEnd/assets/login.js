document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#loginForm");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const errorMessage = document.querySelector("#errorMessage");

        try {
            const response = await fetch("http://localhost:5678/api/users/login", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("Réponse API :", data); // <-- Ajoute ceci pour voir la réponse

            if (response.ok) {
                localStorage.setItem("token", data.token);
                window.location.href = "index.html"; // Redirection vers la page d'accueil
            } else {
                errorMessage.textContent = "Email ou mot de passe incorrect.";
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            errorMessage.textContent = "Une erreur est survenue, veuillez réessayer.";
        }
    });
});
