var map;
const coordenadasSertao = { lat: -30.452567921469193, lng: -51.604965696673126 };

function initMap() {

    //chamando os campos do HTML
    const corInput = document.getElementById('corPoligono');
    var mostrar = document.getElementById('mostrar');
    const limpar = document.getElementById('limpar');
    const exportar = document.getElementById('exportar');

    //criando mapa inicial
    map = new google.maps.Map(document.getElementById('map'), {
        center: coordenadasSertao,
        zoom: 14
    });


    // chamando a lista de poligonos 
    listarPolygons();


    corInput.addEventListener('change', () => {
        initDrawing(map, corInput.value); // Apenas reinicializa o DrawingManager com a nova cor
    });


    // chamando Drawing
    initDrawing(map, corInput.value);

    // botão mostrar / atualizar
    mostrar.addEventListener('click', () => exibirPoligonos(map));

    // removendo da lista 
    limpar.addEventListener('click', () => {
        localStorage.removeItem('polygonList');
        console.log('Polígono removido do localStorage.');
        location.reload();
    });


    // criando JSON
    exportar.addEventListener('click', () => exportarPolygons());

}



let renderedPolygons = [];  // criando vetor para iniciar guardar o polygonos 

function exibirPoligonos(map) {
    // mostra a lista 
    listarPolygons();

    // Remove polígonos já renderizados anteriormente
    renderedPolygons.forEach(p => p.setMap(null));

    // zera a lista para atualizar 
    renderedPolygons = [];


    //  pega os dados na mémoria  ou se não ouver inicia
    const stored = JSON.parse(localStorage.getItem('polygonList')) || [];


    // for para desenhar os poligonos
    stored.forEach((data, index) => {


        // biblioteca GEOMETRY que decodifica os dados.
        const path = google.maps.geometry.encoding.decodePath(data.encodedPath);

        const polygon = new google.maps.Polygon({
            paths: path,
            fillColor: data.color,
            fillOpacity: 0.5,
            strokeWeight: 2,
            editable: false,
            map: map,
        });

        // atualiza a lista
        renderedPolygons.push(polygon);


        console.log(`Polígono ${index + 1} carregado`, path);



    });
    
        stored.forEach((data, index) => {
            const path = google.maps.geometry.encoding.decodePath(data.encodedPath);

            const polygon = new google.maps.Polygon({
                paths: path,
                fillColor: data.color,
                fillOpacity: 0.5,
                strokeWeight: 2,
                editable: false,
                map: map,
            });

            renderedPolygons.push(polygon);

            // Cria o conteúdo do InfoWindow 
            const infoContent = `
                <div style="max-width: 150px;">
                    <h4>Polígono ${index + 1}</h4>
                    <img src="../img/teste.png" alt="Imagem" style="width:100%; border-radius:8px;" />
                </div>
            `;

            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
                position: path[0] // posição inicial do polígono
            });

            // Adiciona evento de clique ao polígono
            polygon.addListener('click', (event) => {
                infoWindow.setPosition(event.latLng); // mostra na posição clicada
                infoWindow.open(map);
            });

            console.log(`Polígono ${index + 1} carregado`, path);
        });

}



// Exibe a lista de poligonos 
function listarPolygons() {

    const lista = document.getElementById('listaPoligonos');
    lista.innerHTML = ''; // limpa a lista

    const stored = JSON.parse(localStorage.getItem('polygonList')) || [];

    if (stored.length === 0) {
        lista.innerHTML = '<p>Nenhum polígono salvo.</p>';
        return;
    }

    stored.forEach((data, index) => {
        const item = document.createElement('div');
        item.innerHTML = `<p><strong>Polígono ${index + 1}</strong> - Cor: <span style="color:${data.color}">${data.color}</span>
            <button onclick="removerPolygon(${data.id})">Remover</button></p>`;
        lista.appendChild(item);
    });
}

// remove o polygono passando o ID
function removerPolygon(id) {
    const stored = JSON.parse(localStorage.getItem('polygonList')) || [];
    const atualizado = stored.filter(p => p.id !== id);

    localStorage.setItem('polygonList', JSON.stringify(atualizado));

    console.log(`Polígono ${id} removido.`);

    location.reload(); // recarrega a página para atualizar o mapa e a lista

}


function exportarPolygons() {

    const stored = JSON.parse(localStorage.getItem('polygonList')) || [];

    //se não houver 
    if (stored.length === 0) {
        console.log('Nada para exportar.');
        return;
    }

    const blob = new Blob([JSON.stringify(stored, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const arquivo = document.createElement('a');
    arquivo.href = url;
    arquivo.download = 'polygonsDados.json';
    arquivo.click();

    URL.revokeObjectURL(url);

    console.log('Arquivo JSON exportado.');
}

