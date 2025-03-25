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
            categorySelect.innerHTML = '<option value="" disabled selected></option>';

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
                    <div class="photo-upload">
                        <!-- Zone de prévisualisation de l'image -->
                        <div class="preview-container">
                            <img id="imagePreview" src="" alt="Aperçu de l'image" style="display: none;">
                            <!-- Icône SVG par défaut -->
                            <svg id="defaultIcon" width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M63.5517 15.8879C64.7228 15.8879 65.681 16.8461 65.681 18.0172V60.5768L65.0156 59.7118L46.9165 36.2894C46.3176 35.5042 45.3727 35.0517 44.3879 35.0517C43.4031 35.0517 42.4715 35.5042 41.8594 36.2894L30.8136 50.5824L26.7546 44.8998C26.1557 44.0614 25.1975 43.569 24.1595 43.569C23.1214 43.569 22.1632 44.0614 21.5644 44.9131L10.9178 59.8183L10.319 60.6434V60.6034V18.0172C10.319 16.8461 11.2772 15.8879 12.4483 15.8879H63.5517ZM12.4483 9.5C7.75048 9.5 3.93103 13.3195 3.93103 18.0172V60.6034C3.93103 65.3012 7.75048 69.1207 12.4483 69.1207H63.5517C68.2495 69.1207 72.069 65.3012 72.069 60.6034V18.0172C72.069 13.3195 68.2495 9.5 63.5517 9.5H12.4483ZM23.0948 35.0517C23.9337 35.0517 24.7644 34.8865 25.5394 34.5655C26.3144 34.2444 27.0186 33.7739 27.6118 33.1807C28.2049 32.5876 28.6755 31.8834 28.9965 31.1083C29.3175 30.3333 29.4828 29.5027 29.4828 28.6638C29.4828 27.8249 29.3175 26.9943 28.9965 26.2192C28.6755 25.4442 28.2049 24.74 27.6118 24.1468C27.0186 23.5537 26.3144 23.0831 25.5394 22.7621C24.7644 22.4411 23.9337 22.2759 23.0948 22.2759C22.2559 22.2759 21.4253 22.4411 20.6503 22.7621C19.8752 23.0831 19.171 23.5537 18.5779 24.1468C17.9847 24.74 17.5142 25.4442 17.1931 26.2192C16.8721 26.9943 16.7069 27.8249 16.7069 28.6638C16.7069 29.5027 16.8721 30.3333 17.1931 31.1083C17.5142 31.8834 17.9847 32.5876 18.5779 33.1807C19.171 33.7739 19.8752 34.2444 20.6503 34.5655C21.4253 34.8865 22.2559 35.0517 23.0948 35.0517Z" fill="#B9C5CC"/>
                            </svg>
                        </div>

                        <!-- Bouton "Ajouter Photo" -->
                        <button type="button" id="addPhotoButton" class="upload-btn">
                            + Ajouter Photo
                        </button>
                        <input type="file" id="photo" accept="image/*" required hidden>

                        <!-- Texte explicatif -->
                        <p>jpg, png : 4mo max</p>
                    </div>
        
                    <!-- Champs du formulaire -->
                    <label for="title">Titre :</label>
                    <input type="text" id="title" required>

                    <label for="categorie">Catégorie :</label>
                    <select id="categorie" required>
                        <option value="" disabled selected></option>
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
    const defaultIcon = document.getElementById('defaultIcon');
    const addPhotoButton = document.getElementById('addPhotoButton');
    
    // Fonction pour déclencher l'input file lorsqu'on clique sur le bouton
    addPhotoButton.addEventListener('click', function() {
        fileInput.click();  // Cela ouvre la fenêtre pour sélectionner un fichier
    });

     // Gestion de l'événement de sélection de fichier
     fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
    
        // Vérifier si un fichier a été sélectionné
        if (!file) return;
    
        // Vérifier le type de fichier (jpg et png uniquement)
        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) {
            alert("Seuls les fichiers JPG et PNG sont autorisés.");
            fileInput.value = ""; // Réinitialise l'input
            return;
        }
    
        // Vérifier la taille du fichier (max 4 Mo)
        const maxSize = 4 * 1024 * 1024; // 4 Mo en octets
        if (file.size > maxSize) {
            alert("La taille du fichier ne doit pas dépasser 4 Mo.");
            fileInput.value = ""; // Réinitialise l'input
            return;
        }
    
        // Lire et afficher l'image si toutes les conditions sont respectées
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; // Affiche l'image
            defaultIcon.style.display = 'none'; // Masque l'icône par défaut
            addPhotoButton.style.display = 'none'; // Masque le bouton "Ajouter Photo"
        };
        reader.readAsDataURL(file);
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
                imagePreview.src = ""; // Effacer l'aperçu précédent
            
                // Réinitialiser l'icône par défaut
                const defaultIcon = document.getElementById('defaultIcon');
                defaultIcon.style.display = 'block'; // Afficher l'icône par défaut
            
                // Réinitialiser le bouton "Ajouter Photo"
                const addPhotoButton = document.getElementById('addPhotoButton');
                addPhotoButton.style.display = 'block'; // Afficher à nouveau le bouton
            
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

    // 1 - Récupération et affichage des projets
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
    

    // 1 - Affichage dynamique dans la galerie
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