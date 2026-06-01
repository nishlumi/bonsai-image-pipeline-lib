import { BonsaiImagePipeline, BonsaiImageResult } from './bonsai-image.js';

async function main() {
  console.log('=== Bonsai Image Library Test ===');
  
  // 1. クラスの存在チェック
  console.log('BonsaiImagePipeline:', typeof BonsaiImagePipeline);
  console.log('BonsaiImageResult:', typeof BonsaiImageResult);
  
  if (typeof BonsaiImagePipeline !== 'function' || typeof BonsaiImageResult !== 'function') {
    throw new Error('Classes are not exported correctly!');
  }
  
  // 2. isSupported() 静的メソッドの動作チェック
  console.log('\nChecking BonsaiImagePipeline.isSupported()...');
  try {
    // Node.js 環境では navigator.gpu が通常存在しないため false になるはず
    const supported = await BonsaiImagePipeline.isSupported();
    console.log('isSupported() returned:', supported);
    console.log('OK: isSupported() executed successfully.');
  } catch (error) {
    console.error('Error during isSupported():', error);
    process.exit(1);
  }
  
  // 3. 新規追加メソッドの動作・存在チェック
  console.log('\nChecking BonsaiImagePipeline new methods...');
  console.log('BonsaiImagePipeline.clearCache:', typeof BonsaiImagePipeline.clearCache);
  if (typeof BonsaiImagePipeline.clearCache !== 'function') {
    throw new Error('BonsaiImagePipeline.clearCache is not exported!');
  }

  // モックを使った getModelName() のチェック
  const mockPipeline = new BonsaiImagePipeline({
    runtime: {},
    pipeline: {},
    modelRoot: 'mockRoot',
    ownsRuntime: false,
    modelName: 'test-model-name'
  });
  console.log('mockPipeline.getModelName:', typeof mockPipeline.getModelName);
  if (typeof mockPipeline.getModelName !== 'function') {
    throw new Error('mockPipeline.getModelName is not defined!');
  }
  const modelName = mockPipeline.getModelName();
  console.log('getModelName() returned:', modelName);
  if (modelName !== 'test-model-name') {
    throw new Error(`getModelName() returned unexpected value: ${modelName}`);
  }
  console.log('OK: New methods are implemented and working correctly.');

  // 4. 便利メソッドの存在チェック
  console.log('\nChecking BonsaiImageResult prototype methods...');
  const testResult = new BonsaiImageResult({
    bytes: new Uint8Array([1, 2, 3]),
    width: 64,
    height: 64,
    prompt: 'test prompt',
    seed: 42
  });
  
  console.log('testResult.toBlob:', typeof testResult.toBlob);
  console.log('testResult.toDataURL:', typeof testResult.toDataURL);
  console.log('testResult.toImageBitmap:', typeof testResult.toImageBitmap);
  
  if (typeof testResult.toBlob !== 'function' || 
      typeof testResult.toDataURL !== 'function' || 
      typeof testResult.toImageBitmap !== 'function') {
    throw new Error('BonsaiImageResult methods are missing!');
  }
  
  console.log('\n=== All local tests passed! ===');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
