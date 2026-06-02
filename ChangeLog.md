# ChangeLog

## [0.0.2] - 2026-06-02

### Added
- `BonsaiImagePipeline.generate()` メソッドに `signal` (`AbortSignal`) オプションを追加。画像生成を途中で安全にキャンセル（中断）可能にしました。
  - キャンセル検知時は `DOMException` ("AbortError") をスロー。
  - キャンセル時もパイプライン上位の `finally` ブロックが必ず実行されるため、GPUのテンソル資源等がリークすることなく安全に解放されます。
- `demo/easydemo.html` に「Cancel image generation」ボタンを追加し、生成キャンセルの動作検証ができるようにUIを拡張。

### Changed
- モデル内の `scheduler/scheduler_config.json` ロード処理をオプション化。ファイルが存在しない（404エラーになる）モデルでも、Bonsai標準のデフォルトパラメータへ自動フォールバックして安全にロードが完了するように修正しました。

## [0.0.1] - 2026-06-01

### Added

- Initial release.