document.addEventListener('DOMContentLoaded', () => {
    // İlkin konfiqurasiya
    let dreams = JSON.parse(localStorage.getItem('dreams')) || [];
    let qualityChart = null;

    // Elementlər
    const elements = {
        date: document.getElementById('dateInput'),
        duration: document.getElementById('durationInput'),
        quality: document.getElementById('qualityInput'),
        description: document.getElementById('descriptionInput'),
        tags: document.getElementById('tagsInput'),
        dreamEntries: document.getElementById('dreamEntries'),
        searchInput: document.getElementById('searchInput')
    };

    // Event Listeners
    document.getElementById('saveBtn').addEventListener('click', saveDream);
    document.getElementById('analyzeBtn').addEventListener('click', analyzeDream);
    elements.searchInput.addEventListener('input', updateDreamList);

    // Əsas funksiyalar
    function saveDream() {
        const dreamData = {
            id: Date.now(),
            date: elements.date.value || new Date().toISOString().split('T')[0],
            duration: parseFloat(elements.duration.value) || 0,
            quality: parseInt(elements.quality.value) || 5,
            description: elements.description.value.trim(),
            tags: elements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (!dreamData.description) return alert('Təsvir daxil edin!');
        
        dreams.push(dreamData);
        localStorage.setItem('dreams', JSON.stringify(dreams));
        updateUI();
        clearForm();
    }

    async function analyzeDream() {
        const description = elements.description.value.trim();
        if (!description) return alert('Təhlil üçün təsvir lazımdır!');

        try {
            const response = await fetch('http://localhost:3000/api/analyze-dream', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({description})
            });
            
            const data = await response.json();
            displayAnalysis(data.analysis || data.error);
        } catch (error) {
            displayAnalysis('Xəta: ' + error.message);
        }
    }

    // UI Yeniləmə
    function updateUI() {
        updateStats();
        updateDreamList();
        updateChart();
    }

    function updateStats() {
        const avgQuality = dreams.length > 0 
            ? (dreams.reduce((sum, d) => sum + d.quality, 0) / dreams.length).toFixed(1)
            : '-';
        
        const avgDuration = dreams.length > 0
            ? (dreams.reduce((sum, d) => sum + d.duration, 0) / dreams.length).toFixed(1) + ' saat'
            : '-';

        document.getElementById('avgQualityValue').textContent = avgQuality;
        document.getElementById('avgDurationValue').textContent = avgDuration;
    }

    function updateDreamList() {
        const searchTerm = elements.searchInput.value.toLowerCase();
        const filtered = dreams.filter(dream => 
            dream.description.toLowerCase().includes(searchTerm) || 
            dream.date.includes(searchTerm)
        );

        elements.dreamEntries.innerHTML = filtered.map(dream => `
            <div class="dream-entry">
                <h3>${dream.date} 
                    <span class="quality">⭐ ${dream.quality}/10</span>
                    <span class="duration">⏱️ ${dream.duration} saat</span>
                </h3>
                <p>${dream.description}</p>
                ${dream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `).join('');
    }

    function updateChart() {
        if (qualityChart) qualityChart.destroy();
        
        qualityChart = new Chart(document.getElementById('qualityChart'), {
            type: 'line',
            data: {
                labels: dreams.map(d => d.date),
                datasets: [{
                    label: 'Keyfiyyət Trendi',
                    data: dreams.map(d => d.quality),
                    borderColor: '#3498db',
                    tension: 0.2
                }]
            }
        });
    }

    // Köməkçi funksiyalar
    function displayAnalysis(text) {
        const analysisDiv = document.getElementById('aiAnalysisText');
        analysisDiv.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        analysisDiv.scrollIntoView({behavior: 'smooth'});
    }

    function clearForm() {
        elements.duration.value = '';
        elements.quality.value = '';
        elements.description.value = '';
        elements.tags.value = '';
    }

    // İlkin yüklənmə
    updateUI();
});