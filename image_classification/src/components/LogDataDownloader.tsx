import type { LogDataElement } from '../types';

type LogDataDownloaderProps = {
  logData: LogDataElement[];
  handleSaveLogsClick: () => void;
};

export const LogDataDownloader: React.FC<LogDataDownloaderProps> = ({
  logData,
  handleSaveLogsClick,
}) => {
  return (
    <>
      {/* ▼ アクションバー（ログ保存ボタン＋件数表示） */}
      <div className="mt-6 w-full max-w-4xl flex items-center justify-between gap-3">
        <span className="text-sm text-gray-400">
          Logs collected: <span className="font-semibold text-gray-200">{logData.length}</span>
        </span>

        <button
          type="button"
          onClick={handleSaveLogsClick}
          disabled={logData.length === 0}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
           shadow-lg ring-1 ring-white/10
           bg-gradient-to-r from-indigo-500 to-fuchsia-600
           hover:from-indigo-400 hover:to-fuchsia-500
           disabled:opacity-40 disabled:cursor-not-allowed
           focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-label="Save logs as JSON"
          title={logData.length === 0 ? 'No logs to save yet' : 'Save logs as JSON'}
        >
          {/* download icon (inline SVG, no外部依存) */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="M8 11l4 4 4-4" />
            <path d="M21 21H3" />
          </svg>
          Save logs (.json)
        </button>
      </div>
    </>
  );
};
