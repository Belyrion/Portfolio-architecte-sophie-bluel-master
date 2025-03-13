document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector("nav ul");
    const token = localStorage.getItem("token");

    // Si un utilisateur est connecté
    if (token) {
        const logoutBtn = document.createElement("li");
        logoutBtn.textContent = "Logout";
        logoutBtn.style.cursor = "pointer";

        // Fonction pour se déconnecter
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });

        // Remplacer le bouton de login par un bouton de logout
        const loginItem = nav.querySelector("li:nth-child(3)");
        if (loginItem) {
            nav.replaceChild(logoutBtn, loginItem);
        }
        
        // Ajouter le bouton Modifier dans le portfolio si connecté
        const portfolioSection = document.querySelector('#portfolio');
        const portfolioTitle = portfolioSection.querySelector('h2');
        
        if (portfolioTitle) {
            const titleContainer = document.createElement("div");
            titleContainer.classList.add("title-container");

            const editButton = document.createElement("button");
            editButton.classList.add("edit-btn");
            editButton.setAttribute("id", "editButton");

            const editIcon = document.createElement("i");
            editIcon.classList.add("fa-solid", "fa-pen-to-square");
            editButton.appendChild(editIcon);

            const editText = document.createTextNode(" Modifier");
            editButton.appendChild(editText);

            titleContainer.appendChild(portfolioTitle);
            titleContainer.appendChild(editButton);
            portfolioSection.insertBefore(titleContainer, portfolioSection.querySelector(".category-menu"));
        }
    }

    // Fonction pour charger les catégories dynamiquement
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:5678/api/categories');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des catégories.');
            }
            const categories = await response.json();
            
            const categorySelect = document.getElementById("categorie");
            categorySelect.innerHTML = '<option value="" disabled selected>Choisissez une catégorie</option>';

            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur :', error);
        }
    }
    loadCategories();

    

    // Modal
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <!-- PAGE 1 : Galerie -->
            <div class="page1">
                <span class="close">&times;</span>
                <h2>Galerie photo</h2>
                <div class="modal-gallery"></div>
                <div class="button-container">
                    <div class="line-separator"></div>
                    <button class="add-photo-btn">Ajouter une photo</button>
                </div>
            </div>
            <!-- PAGE 2 : Formulaire d'ajout -->
            <div class="page2" style="display: none;">
                <i class="fa-solid fa-arrow-left back-icon"></i>
                <span class="close">&times;</span>
                <h2>Ajout photo</h2>
                <form id="addPhotoForm">
                     <!-- Zone de prévisualisation de l'image -->
                    <div class="photo-upload">
                        <div class="preview-container">
                            <img id="imagePreview" src="" alt="Aperçu de l'image" style="display: none;">
                        </div>
                        <label for="photo" class="upload-btn">
                            <i class="fa-solid fa-image"></i>
                        </label>
                        <input type="file" id="photo" accept="image/*" required hidden>
                        <p>jpg, png : 4mo max</p>
                    </div>
        
                    <!-- Champs du formulaire -->
                    <label for="title">Titre :</label>
                    <input type="text" id="title" required>

                    <label for="categorie">Catégorie :</label>
                    <select id="categorie" required>
                        <option value="" disabled selected>Choisissez une catégorie</option>
                    </select>

                    <!-- Bouton de validation -->
                    <div class="line-separator"></div>
                    <button type="submit" class="submit-btn">Valider</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
     // Prévisualisation de l'image sélectionnée
     const fileInput = modal.querySelector("#photo");
     const imagePreview = modal.querySelector("#imagePreview");
     
     fileInput.addEventListener("change", (event) => {
         const file = event.target.files[0];
         if (file) {
             const reader = new FileReader();
             reader.onload = (e) => {
                 imagePreview.innerHTML = `<img src="${e.target.result}" alt="Aperçu">`;
             };
             reader.readAsDataURL(file);
         }
     });
    

    // Fonction pour vérifier si tous les champs du formulaire sont remplis
    function checkForm() {
        const form = document.getElementById("addPhotoForm");
        const title = form.querySelector("#title");
        const category = form.querySelector("#categorie");
        const file = form.querySelector("#photo");
        const submitBtn = form.querySelector(".submit-btn");

        // Vérifier si tous les champs sont remplis
        if (title.value.trim() !== "" && category.value.trim() !== "" && file.files.length > 0) {
            submitBtn.disabled = false; // Activer le bouton si tous les champs sont remplis
        } else {
            submitBtn.disabled = true; // Désactiver le bouton si un champ est vide
        }
    }

    // Ajouter des écouteurs d'événements pour surveiller les modifications des champs
    document.getElementById("title").addEventListener("input", checkForm);
    document.getElementById("categorie").addEventListener("change", checkForm);
    document.getElementById("photo").addEventListener("change", checkForm);

    // Initialement, le bouton est désactivé
    checkForm();

    // Initialement cacher le modal
    modal.style.display = "none"; // Masquer le modal au chargement de la page

    // Ajouter un écouteur d'événement au bouton Modifier pour ouvrir le modal
const editButton = document.getElementById("editButton");
if (editButton) {
    editButton.addEventListener("click", () => {
        // Réinitialiser l'état de la modale à la page 1 (galerie)
        page1.style.display = "block"; // Afficher la page 1
        page2.style.display = "none";  // Cacher la page 2
        
        modal.style.display = "block"; // Afficher la modale
        loadModalGallery(); // Charger les images dans le modal
    });
}

    // Fermer le modal si on clique sur la croix ou en dehors du modal
    document.addEventListener("click", (event) => {
        if (event.target === modal || event.target.classList.contains("close")) {
            modal.style.display = "none"; // Fermer le modal
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });

    // Sélectionner le formulaire et ajouter un écouteur d'événement sur la soumission
    document.getElementById("addPhotoForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // Empêcher le rechargement de la page

        // Récupération des valeurs des champs
        const title = document.getElementById("title").value;
        const category = document.getElementById("categorie").value;
        const imageFile = document.getElementById("photo").files[0];

        // Vérification si tous les champs sont remplis
        if (!title || !category || !imageFile) {
            alert("Veuillez remplir tous les champs !");
            return;
        }

        // Création de l'objet FormData pour envoyer les données en multipart/form-data
        const formData = new FormData();
        formData.append("title", title);
        formData.append("category", category);
        formData.append("image", imageFile);

        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}` // Ajout du token si nécessaire
                },
                body: formData
            });

        if (!response.ok) {
            throw new Error("Erreur lors de l'envoi des données.");
        }

        alert("Photo ajoutée avec succès !");
        document.querySelector(".page2").style.display = "none"; // Fermer la page 2
        document.querySelector(".page1").style.display = "block"; // Revenir à la galerie
        loadModalGallery(); // Recharger la galerie pour afficher la nouvelle image
        loadGallery();
        modal.style.display = "none";

        } catch (error) {
            console.error("Erreur :", error);
            alert("Une erreur est survenue lors de l'ajout de la photo.");
        }
    });
    

    // Fonction pour charger la galerie du modal
    async function loadModalGallery() {
        try {
            const response = await fetch('http://localhost:5678/api/works');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des images.');
            }
            const works = await response.json();
            displayModalGallery(works); // Afficher les œuvres dans le modal
        } catch (error) {
            console.error('Erreur :', error);
        }
    }

    // Fonction pour afficher les œuvres dans le modal
    function displayModalGallery(works) {
        const galleryContainer = document.querySelector(".modal-gallery");
        galleryContainer.innerHTML = ""; // Vider la galerie avant de la remplir
    
        // Vider la section de la galerie, mais ne pas toucher au bouton et à la ligne
        const modalContent = document.querySelector(".page1");
        let buttonContainer = modalContent.querySelector(".button-container");
        
        if (buttonContainer) {
            buttonContainer.remove(); // Supprimer le conteneur de bouton existant si déjà ajouté
        }
    
        // Affichage des œuvres
        if (works.length === 0) {
            galleryContainer.innerHTML = "<p>Aucune image à afficher</p>"; // Afficher un message s'il n'y a pas d'images
        } else {
            works.forEach(work => {
                const figure = document.createElement("figure");
    
                const img = document.createElement("img");
                img.src = work.imageUrl;
                img.alt = work.title; // Texte alternatif pour l'image
    
                // Ajouter l'image
                figure.appendChild(img);
    
                // Créer l'icône de suppression
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add("fa-solid", "fa-trash-can", "delete-icon");  // Ajouter la classe delete-icon pour appliquer le style CSS
    
                // Ajouter l'icône de suppression au figure
                figure.appendChild(deleteIcon);
    
                // Ajouter un écouteur d'événement sur l'icône pour supprimer l'image
                deleteIcon.addEventListener('click', async (e) => {
                    try {
                        // Suppression de l'image via l'API
                        const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}` // Si l'utilisateur est connecté
                            }
                        });

                        if (!response.ok) {
                            throw new Error('Erreur lors de la suppression de l\'image');
                        }
    
                        // Supprimer l'élément figure de la galerie modale
                        figure.remove();

                        // Supprimer l'image correspondante dans la galerie principale
                        document.querySelector(`.gallery figure[data-id="${work.id}"]`)?.remove();
                        
                    } catch (error) {
                        console.error('Erreur :', error);
                    }
                });

                galleryContainer.appendChild(figure); // Ajouter l'image à la galerie modale
            });
        }

        // Ajouter uniquement la ligne et le bouton si ce n'est pas déjà fait
        if (!modalContent.querySelector(".button-container")) {
            // Créer un conteneur pour la ligne et le bouton
            buttonContainer = document.createElement("div");
            buttonContainer.classList.add("button-container");
    
            // Ajouter la ligne séparatrice
            const lineDiv = document.createElement("div");
            lineDiv.classList.add("line-separator");
            buttonContainer.appendChild(lineDiv);
    
            // Ajouter le bouton "Ajouter"
            const addButton = document.createElement("button");
            addButton.textContent = "Ajouter une photo";
            addButton.classList.add("add-btn");
    
            buttonContainer.appendChild(addButton);
    
            // Ajouter ce conteneur après la galerie
            galleryContainer.parentElement.appendChild(buttonContainer);

            addButton.addEventListener("click", () => {
                page1.style.display = "none";
                page2.style.display = "block";

                // Réinitialiser le formulaire
                const form = document.getElementById("addPhotoForm");
                form.reset(); // Réinitialiser le formulaire

                // Cacher la prévisualisation de l'image
                const imagePreview = modal.querySelector("#imagePreview");
                imagePreview.style.display = "none"; // Masquer l'aperçu de l'image

                // Désactiver le bouton "Valider" au départ
                const submitBtn = form.querySelector(".submit-btn");
                submitBtn.disabled = true;

                // Vérifier à nouveau l'état du formulaire
                checkForm(); // Vérifie les champs du formulaire et active ou désactive le bouton "Valider"
            });
        }
    }

    // Sélection des éléments
    const page1 = modal.querySelector(".page1");
    const page2 = modal.querySelector(".page2");
    const backIcon = modal.querySelector(".back-icon");

    if (backIcon) {
        backIcon.addEventListener("click", () => {
            page2.style.display = "none"; // Cacher la page 2
            page1.style.display = "block"; // Réafficher la page 1
        });
    }

    // Sélectionner la galerie et la section portfolio
    const galleryElement = document.querySelector('.gallery');
    const categoryMenuElement = document.createElement('div');
    categoryMenuElement.classList.add('category-menu');
    
    // Insérer le menu des catégories avant la galerie
    const portfolioSection = document.querySelector('#portfolio');
    portfolioSection.insertBefore(categoryMenuElement, galleryElement);

    // Fonction pour charger les éléments de la galerie
    async function loadGallery(categoryId = "all") {
        try {
            const response = await fetch('http://localhost:5678/api/works');
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }
            const works = await response.json(); // Convertir la réponse en JSON

            // Filtrer les œuvres si une catégorie spécifique est sélectionnée
            const filteredWorks = categoryId === "all" ? works : works.filter(work => work.category.id == categoryId);

            displayWorks(filteredWorks); // Afficher les œuvres dans la galerie

            // Si le menu des catégories n'a pas encore d'éléments, on le génère
            if (!categoryMenuElement.hasChildNodes()) {
                generateCategoryMenu(works); // Générer le menu des catégories
            }

            // Masquer le menu des catégories si l'utilisateur est connecté
            if (token) {
                categoryMenuElement.style.display = "none"; // Masquer le menu des catégories pour les utilisateurs connectés
            }

        } catch (error) {
            console.error('Erreur :', error); // Afficher les erreurs en cas d'échec de la requête
        }
    }
    

    // Fonction pour afficher les œuvres dans la galerie
    function displayWorks(works) {
        galleryElement.innerHTML = ''; // Vider la galerie avant d'y ajouter les nouvelles œuvres
        works.forEach(work => {
            const figure = createFigure(work); // Créer un élément figure pour chaque œuvre
            galleryElement.appendChild(figure); // Ajouter l'élément à la galerie
        });
    }

    // Fonction pour créer un élément figure avec une image et un titre
    function createFigure(work) {
        const figure = document.createElement('figure');
        figure.setAttribute('data-id', work.id); // Ajout de l'ID dans l'attribut data-id
    
        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;
    
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;
    
        figure.appendChild(img);
        figure.appendChild(figcaption);
    
        return figure;
    }

    // Fonction pour générer le menu des catégories
    function generateCategoryMenu(works) {
        const categories = new Map(); // Créer un objet Map pour stocker les catégories uniques

        // Ajouter un bouton pour afficher toutes les œuvres
        categoryMenuElement.innerHTML = '<button data-id="all" class="active">Tous</button>';

        // Ajouter chaque catégorie à la Map (afin d'éviter les doublons)
        works.forEach(work => {
            if (!categories.has(work.category.id)) {
                categories.set(work.category.id, work.category.name);
            }
        });

        // Créer un bouton pour chaque catégorie
        categories.forEach((name, id) => {
            const button = document.createElement('button');
            button.textContent = name; // Nom de la catégorie
            button.setAttribute('data-id', id); // Associer l'ID de la catégorie au bouton
            categoryMenuElement.appendChild(button); // Ajouter le bouton au menu
        });

        // Ajouter des écouteurs d'événements aux boutons pour filtrer les œuvres par catégorie
        addCategoryFilterListeners();
    }

    // Ajouter des écouteurs d'événements pour filtrer les œuvres par catégorie
    function addCategoryFilterListeners() {
        const buttons = categoryMenuElement.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Ajouter la classe 'active' au bouton sélectionné et la supprimer des autres
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const categoryId = button.getAttribute('data-id');
                loadGallery(categoryId); // Charger les œuvres de la catégorie sélectionnée
            });
        });
    }

    // Charger la galerie initiale
    loadGallery();
});