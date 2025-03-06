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

    // Modal
    const modal = document.createElement("div");
    modal.id = "modal";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Galerie photo</h2>
            <div class="modal-gallery"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Initialement cacher le modal
    modal.style.display = "none"; // Masquer le modal au chargement de la page

    // Ajouter un écouteur d'événement au bouton Modifier pour ouvrir le modal
    const editButton = document.getElementById("editButton");
    if (editButton) {
        editButton.addEventListener("click", () => {
            modal.style.display = "block"; // Afficher le modal au clic sur Modifier
            loadModalGallery(); // Charger les images dans le modal
        });
    }

    // Fermer le modal si on clique sur la croix ou en dehors du modal
    document.addEventListener("click", (event) => {
        if (event.target === modal || event.target.classList.contains("close")) {
            modal.style.display = "none"; // Fermer le modal
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
        const modalContent = document.querySelector(".modal-content");
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
        }
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
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');

        img.src = work.imageUrl; // Ajouter l'URL de l'image
        img.alt = work.title; // Ajouter un texte alternatif pour l'image
        figcaption.textContent = work.title; // Ajouter le titre de l'œuvre

        figure.appendChild(img); // Ajouter l'image à l'élément figure
        figure.appendChild(figcaption); // Ajouter le titre à l'élément figure

        return figure; // Retourner l'élément figure
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