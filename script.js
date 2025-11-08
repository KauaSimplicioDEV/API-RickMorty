const apiUrl = 'https://rickandmortyapi.com/api/character';
const cardsContainer = document.getElementById('cards-container');
const loadingElement = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const characterCount = document.getElementById('characterCount');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

let allCharacters = [];
let filteredCharacters = [];
let currentPage = 1;
let nextPage = null;
let currentFilter = 'all';
let currentSearch = '';

function createCard(character) {
    const card = document.createElement('div');
    card.className = 'card';

    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = character.image;
    image.alt = character.name;
    image.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = character.name;

    const species = document.createElement('p');
    species.className = 'card-info';
    species.innerHTML = '<strong>Espécie:</strong> <span>' + character.species + '</span>';

    const gender = document.createElement('p');
    gender.className = 'card-info';
    gender.innerHTML = '<strong>Gênero:</strong> <span>' + character.gender + '</span>';

    const origin = document.createElement('p');
    origin.className = 'card-info';
    origin.innerHTML = '<strong>Origem:</strong> <span>' + character.origin.name + '</span>';

    const location = document.createElement('p');
    location.className = 'card-info';
    location.innerHTML = '<strong>Localização:</strong> <span>' + character.location.name + '</span>';

    const status = document.createElement('span');
    status.className = 'status ' + character.status.toLowerCase();
    status.textContent = character.status === 'Alive' ? 'Vivo' :
        character.status === 'Dead' ? 'Morto' : 'Desconhecido';

    content.appendChild(title);
    content.appendChild(species);
    content.appendChild(gender);
    content.appendChild(origin);
    content.appendChild(location);
    content.appendChild(status);

    card.appendChild(image);
    card.appendChild(content);

    card.addEventListener('click', () => openModal(character));

    return card;
}

function openModal(character) {
    document.getElementById('modalImage').src = character.image;
    document.getElementById('modalTitle').textContent = character.name;

    const modalInfo = document.getElementById('modalInfo');
    modalInfo.innerHTML = `
        <div class="modal-info">
            <strong>Status:</strong>
            <span class="status ${character.status.toLowerCase()}">
                ${character.status === 'Alive' ? 'Vivo' : character.status === 'Dead' ? 'Morto' : 'Desconhecido'}
            </span>
        </div>
        <div class="modal-info"><strong>Espécie:</strong> ${character.species}</div>
        <div class="modal-info"><strong>Gênero:</strong> ${character.gender}</div>
        <div class="modal-info"><strong>Origem:</strong> ${character.origin.name}</div>
        <div class="modal-info"><strong>Localização:</strong> ${character.location.name}</div>
    `;

    const episodesList = document.getElementById('modalEpisodes');
    episodesList.innerHTML = '<h3>Episódios Aparecidos:</h3>';
    if (character.episode && character.episode.length > 0) {
        const episodeNumbers = character.episode.map(ep => {
            const match = ep.match(/\/(\d+)$/);
            return match ? match[1] : '';
        }).filter(Boolean).slice(0, 10);
        episodesList.innerHTML += `<p>Episódios: ${episodeNumbers.join(', ')}${character.episode.length > 10 ? ` e mais ${character.episode.length - 10}...` : ''}</p>`;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

function filterCharacters() {
    filteredCharacters = allCharacters.filter(char => {
        const matchesSearch = char.name.toLowerCase().includes(currentSearch.toLowerCase());
        const matchesFilter = currentFilter === 'all' ||
            (currentFilter === 'unknown' && char.status.toLowerCase() === 'unknown') ||
            (currentFilter !== 'unknown' && char.status === currentFilter);
        return matchesSearch && matchesFilter;
    });

    cardsContainer.innerHTML = '';
    if (filteredCharacters.length === 0) {
        cardsContainer.innerHTML = '<div class="no-results">Nenhum personagem encontrado</div>';
    } else {
        filteredCharacters.forEach(character => {
            const card = createCard(character);
            cardsContainer.appendChild(card);
        });
    }
    characterCount.textContent = filteredCharacters.length;
}

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        currentSearch = e.target.value.trim();
        console.log(`🔍 Buscando personagem: "${currentSearch}"...`);

        filterCharacters();

        if (filteredCharacters.length > 0) {
            console.log(`✅ Sucesso! ${filteredCharacters.length} personagem(ns) encontrado(s).`);
        } else {
            console.log('❌ Nenhum personagem encontrado com esse nome.');
        }
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        filterCharacters();
    });
});

function loadCharacters(page = 1) {
    loadingElement.style.display = 'block';
    loadMoreBtn.disabled = true;

    console.log(`🔄 Buscando personagens da página ${page}...`);

    fetch(`${apiUrl}?page=${page}`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Dados recebidos da API:", data);

            loadingElement.style.display = 'none';

            allCharacters = [...allCharacters, ...data.results];
            nextPage = data.info.next ? page + 1 : null;

            if (!nextPage) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }

            filterCharacters();

            loadMoreBtn.disabled = false;
        })
        .catch(error => {
            loadingElement.innerHTML = '<p>Erro ao carregar personagens. Tente novamente.</p>';
            loadMoreBtn.disabled = false;
            console.error('❌ Erro ao carregar personagens:', error);
        });
}

loadMoreBtn.addEventListener('click', () => {
    if (nextPage) {
        loadCharacters(nextPage);
    }
});

loadCharacters(1);
