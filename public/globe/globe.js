     // Color Setting
     const colorSetting = 'white';
     const highlightSetting = 'yellow';
     const arcSetting = 'grey';

     const stanLat = 47.74;
     const stanLng = 9.50;

     // My Locations
     const myLocations = [
            {  
                name: 'New York',
                country: 'United States',
                lat: 40.7128, 
                lng: -74.0059,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 40.7128,
                endLng: -74.0059,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'London',
                country: 'United Kingdom',
                lat: 51.5074,
                lng: -0.1278,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 51.5074,
                endLng: -0.1278,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Novalja',
                country: 'Croatia',
                lat: 45.8153,
                lng: 15.9665,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 45.8153,
                endLng: 15.9665,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Berlin',
                country: 'Germany',
                lat: 52.5200,
                lng: 13.4050,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 52.5200,
                endLng: 13.4050,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Rhodos',
                country: 'Greece',
                lat: 36.3933,
                lng: 28.0833,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 36.3933,
                endLng: 28.0833,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Sønderborg',
                country: 'Denmark',
                lat: 55.6667,
                lng: 11.0000,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 55.6667,
                endLng: 11.0000,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Bozen',
                country: 'Italy',
                lat: 46.4986,
                lng: 11.3437,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 46.4986,
                endLng: 11.3437,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Laax',
                country: 'Switzerland',
                lat: 46.8167,
                lng: 8.9167,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 46.8167,
                endLng: 8.9167,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Amsterdam',
                country: 'Netherlands',
                lat: 52.3667,
                lng: 4.9000,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 52.3667,
                endLng: 4.9000,
                color: colorSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Brussels',
                country: 'Belgium',
                lat: 50.8333,
                lng: 4.3333,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 50.8333,
                endLng: 4.3333,
                color: highlightSetting,
                arcCol: arcSetting
            },
            {  
                name: 'Pula',
                country: 'Croatia',
                lat: 44.8167,
                lng: 13.8167,
                startLat: stanLat,
                startLng: stanLng,
                endLat: 44.8167,
                endLng: 13.8167,
                color: highlightSetting,
                arcCol: arcSetting
            },
    ];

      // Generate Globe
      const Globe = new ThreeGlobe()
        .globeImageUrl('./assets/globe_texture.jpeg')
        .bumpImageUrl('./assets/globe_topology.png')
        // Points
        .pointsData(myLocations)
        .pointColor('color')
        .pointRadius([0.2])
        .pointsTransitionDuration([3500])
        .pointResolution([50])
        // Arcs
        .arcsData(myLocations)
        .arcColor('arcCol')
        .arcDashLength([0.8])
        .arcDashGap([0.2])
        .arcDashAnimateTime([3500])
        .arcStroke([0.25])
        .arcsTransitionDuration([2000])
        // Other
      
  
      // Setup renderer
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('globeViz').appendChild(renderer.domElement);
  
      // Setup scene
      const scene = new THREE.Scene();
      scene.add(Globe);
      scene.add(new THREE.AmbientLight(0xbbbbbb));
      scene.add(new THREE.DirectionalLight(0xffffff, 0.25));
  
      // Setup camera
      const camera = new THREE.PerspectiveCamera();
      camera.aspect = window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
      camera.position.z = 400;
  
      // Add camera controls
      const tbControls = new THREE.TrackballControls(camera, renderer.domElement);
      tbControls.minDistance = 101;
      tbControls.rotateSpeed = 1;
      tbControls.zoomSpeed = 0.8;
  
      // Kick-off renderer
      (function animate() { // IIFE
        // Frame cycle
        tbControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      })();


    // Interface
    for (let i = 0; i < myLocations.length; i++) {
    document.querySelector('#places').innerHTML += '<p>' + myLocations[i].name + ', <span class="grey">' + myLocations[i].country + '</span></p>';
    }

    for (let u = myLocations.length - 2; u < myLocations.length; u++) {
    document.querySelector('#upcoming').innerHTML += '<p><span class="highlight">' + myLocations[u].name + ', ' + myLocations[u].country + '</span></p>';
    }
