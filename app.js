let dreams = JSON.parse(localStorage.getItem('dreams')) || [];
let qualityChart = null;

// Yuxunu Saxlamaq
function saveDream() {
    const dream = {
        id: Date.now(),
        date: document.getElementById('date').value,
        duration: parseFloat(document.getElementById('duration').value),
        quality: parseInt(document.getElementById('quality').value),
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim())
    };

    dreams.push(dream);
    localStorage.setItem('dreams', JSON.stringify(dreams));
    updateUI();
    showRecommendation(dream.quality);
}

// Tövsiyələr
function showRecommendation(quality) {
    if (quality < 5) {
        alert("⚠️ Yuxu keyfiyyətiniz aşağıdır! Tövsiyələr:\n1. Gecə telefon istifadəsini azaldın.\n2. Yataq otağını qaranlıq edin.\n3. Daimi yuxu cədvəli yaradın.");
    }
}

// Statistika və Qrafiklər
function updateUI() {
    // Yuxu siyahısını göstər
    const dreamList = document.getElementById('dreamList');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredDreams = dreams.filter(dream => 
        dream.description.toLowerCase().includes(searchQuery) || 
        dream.date.includes(searchQuery)
    );

    dreamList.innerHTML = filteredDreams.map(dream => `
        <div class="dream-entry">
            <h3>${dream.date} (${dream.duration} saat ⏱️ | Keyfiyyət: ${dream.quality}/10 ⭐)</h3>
            <p>${dream.description}</p>
            <div>${dream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
        </div>
    `).join('');

    // Teq bulutu
    const tags = dreams.flatMap(dream => dream.tags);
    const tagCounts = tags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});

    const tagCloud = document.getElementById('tagCloud');
    tagCloud.innerHTML = Object.entries(tagCounts).map(([tag, count]) => `
        <span class="tag" style="font-size: ${14 + count * 4}px">${tag}</span>
    `).join('');

    // Keyfiyyət qrafiki
    const labels = dreams.map(dream => dream.date);
    const data = dreams.map(dream => dream.quality);

    if (qualityChart) qualityChart.destroy();
    qualityChart = new Chart(document.getElementById('qualityChart'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Yuxu Keyfiyyəti',
                data: data,
                borderColor: '#3498db',
                tension: 0.1
            }]
        }
    });
}

// Axtarış
document.getElementById('searchInput').addEventListener('input', updateUI);

// İlk yüklənmə
updateUI();