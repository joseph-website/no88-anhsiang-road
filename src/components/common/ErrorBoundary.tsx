import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 font-serif select-none">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-amber-200 font-serif">
              畫面載入異常・已啟動安全保護
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-mono">
              {this.state.error?.message || '未知運行時例外'}
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-600 text-amber-200 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清理快取並重啟事務所檔案</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

