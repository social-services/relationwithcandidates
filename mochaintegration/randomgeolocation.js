function randomGeoLocation () {
  return {
    latitude: 40+8*Math.random(),
    longitude: 20+4*Math.random()
  };
}

setGlobal('randomGeoLocation', randomGeoLocation);
