var drawingManager = null; 



var initDrawing = (map, color) => {

    // Se já houver um drawingManager aberto, remove ele do mapa
    if (drawingManager) {
        drawingManager.setMap(null);
    }


    drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon'] // defini as opções 
        },
        polygonOptions: {
            fillColor: color,
            fillOpacity: 0.7,
            strokeWeight: 5,
            zIndex: 1,
            editable: true,
        }
    });

    drawingManager.setMap(map);


    // evento da API 
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
      
        const path = polygon.getPath();
        const polygonId = Date.now(); // gera um ID
        polygon.__customId = polygonId; // adiciona um elemento proprio 

        const updatePathData = () => {
            console.clear();
            console.log('Coordenadas atualizadas do polígono:');
            path.forEach((latLng, i) => {
                console.log(`Ponto ${i + 1}:`, latLng.lat(), latLng.lng());
            });


            const encodedPath = google.maps.geometry.encoding.encodePath(path);  // transforma as coordenadas em string codificada 

           // Tenta buscar a lista polygonList do localStorage
            const storedPolygons = JSON.parse(localStorage.getItem('polygonList')) || []; 

            
            // procura na lista se ja existe, vai retornar o indice ou se encontrar retorna -1  
            const existingIndex = storedPolygons.findIndex(p => p.id === polygonId);  

            if (existingIndex !== -1) { // se ja existe atualiza
                storedPolygons[existingIndex].encodedPath = encodedPath;
                storedPolygons[existingIndex].color = color;
            } else { // senão ele adiciona 
                storedPolygons.push({ id: polygonId, encodedPath, color });
            }

            // gera o JSON codificado
            localStorage.setItem('polygonList', JSON.stringify(storedPolygons));

            console.log('Polígono salvo com cor:', color);
            console.log('Encoded Path do polígono atualizado:', encodedPath);
        };
        //atualiza tudo 
        updatePathData();

            // funções para edição do poligono 
        google.maps.event.addListener(path, 'set_at', updatePathData);
        google.maps.event.addListener(path, 'insert_at', updatePathData);
        google.maps.event.addListener(path, 'remove_at', updatePathData);
    });
};
