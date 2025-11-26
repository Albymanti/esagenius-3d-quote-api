import fs from 'fs/promises';

export async function parseSTLAndGetMeshData(filePath) {
  await fs.readFile(filePath);

  // Placeholder – valori finti per test
  const sizeX = 200;
  const sizeY = 150;
  const sizeZ = 80;

  const volume_mm3 = sizeX * sizeY * sizeZ;

  return {
    volume_mm3,
    bbox: { sizeX, sizeY, sizeZ }
  };
}

export function mm3ToCm3(volume_mm3) {
  return volume_mm3 / 1000;
}