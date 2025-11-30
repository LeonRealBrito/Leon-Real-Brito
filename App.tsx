import React, { useState, useRef } from 'react';
import Header from './components/Header';
import { UploadCloud, FileAudio, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { AppStatus, ProcessingState, DubResult, VoiceOption } from './types';
import { transcribeAndTranslate, generateSpanishAudio } from './services/geminiService';
import { ProcessingStep } from './components/ProcessingStep';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>({
    status: AppStatus.IDLE,
    message: '',
    progress: 0
  });
  const [result, setResult] = useState<DubResult | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VoiceOption.PUCK);
  const [syncMode, setSyncMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic client-side validation for audio type
      if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
        alert("Por favor selecciona un archivo de audio válido.");
        return;
      }
      setFile(selectedFile);
      setState({ ...state, status: AppStatus.IDLE, message: '' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      }
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    try {
      // 1. Uploading (Simulated, as we send base64 directly)
      setState({ status: AppStatus.UPLOADING, message: 'Preparando archivo...', progress: 10 });
      
      // 2. Transcribe & Translate
      setState({ status: AppStatus.TRANSCRIBING, message: syncMode ? 'Analizando tiempos y traduciendo...' : 'Escuchando y traduciendo...', progress: 30 });
      const translationResult = await transcribeAndTranslate(file, syncMode);
      
      // 3. Generate Audio
      setState({ status: AppStatus.GENERATING_AUDIO, message: 'Generando voz en español...', progress: 70 });
      const audioBlob = await generateSpanishAudio(translationResult.spanishText, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);

      // 4. Success
      setResult({
        originalText: translationResult.originalTranscript,
        translatedText: translationResult.spanishText,
        audioUrl: audioUrl
      });
      setState({ status: AppStatus.SUCCESS, message: '¡Listo!', progress: 100 });

    } catch (error) {
      console.error(error);
      setState({ 
        status: AppStatus.ERROR, 
        message: 'Ocurrió un error al procesar el audio. Por favor intenta de nuevo.', 
        progress: 0 
      });
    }
  };

  const resetApp = () => {
    setFile(null);
    setResult(null);
    setState({ status: AppStatus.IDLE, message: '', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col items-center justify-center">
        
        {/* Intro Text */}
        {state.status === AppStatus.IDLE && !result && (
          <div className="text-center mb-12 space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 pb-2">
              Rompe la barrera del idioma
            </h2>
            <p className="text-lg text-slate-400">
              Sube podcasts, notas de voz o conferencias y escúchalos en español al instante. 
              Sin límites de tiempo.
            </p>
          </div>
        )}

        {/* Upload Area */}
        {!result && (
          <div className="w-full max-w-xl space-y-8">
            <div 
              className={`
                relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                ${file ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*,video/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={state.status !== AppStatus.IDLE}
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className={`
                  p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110
                  ${file ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}
                `}>
                  {file ? <FileAudio className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    {file ? file.name : 'Sube tu audio aquí'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Arrastra o haz clic para seleccionar (MP3, WAV, M4A)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            {file && state.status === AppStatus.IDLE && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Voice Selector */}
                  <div className="space-y-2">
                     <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Voz del narrador</label>
                     <select 
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value as VoiceOption)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                     >
                       <option value={VoiceOption.PUCK}>Puck (Masculino, Suave)</option>
                       <option value={VoiceOption.KORE}>Kore (Femenino, Calmado)</option>
                       <option value={VoiceOption.FENRIR}>Fenrir (Masculino, Profundo)</option>
                       <option value={VoiceOption.ZEPHYR}>Zephyr (Femenino, Enérgico)</option>
                     </select>
                  </div>

                  {/* Sync Toggle */}
                  <div 
                    onClick={() => setSyncMode(!syncMode)}
                    className={`
                      relative cursor-pointer rounded-lg border px-4 py-2 flex items-center justify-between transition-all duration-200
                      ${syncMode 
                        ? 'bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${syncMode ? 'text-indigo-300' : 'text-slate-300'}`}>
                        Sincronización Labial (Beta)
                      </span>
                      <span className="text-xs text-slate-500">Mantener pausas originales</span>
                    </div>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center border transition-all
                      ${syncMode ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'}
                    `}>
                      {syncMode && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleProcess}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {syncMode && <Clock className="w-5 h-5" />}
                  {syncMode ? 'Generar Doblaje Sincronizado' : 'Comenzar Doblaje'}
                </button>
              </div>
            )}

            {/* Progress Status */}
            {state.status !== AppStatus.IDLE && state.status !== AppStatus.SUCCESS && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid gap-3">
                  <ProcessingStep 
                    label="Subiendo y Analizando Audio" 
                    isCompleted={state.status === AppStatus.TRANSCRIBING || state.status === AppStatus.GENERATING_AUDIO}
                    isActive={state.status === AppStatus.UPLOADING}
                    isError={state.status === AppStatus.ERROR}
                  />
                  <ProcessingStep 
                    label={syncMode ? "Adaptando Tiempos y Traduciendo" : "Transcribiendo y Traduciendo"}
                    isCompleted={state.status === AppStatus.GENERATING_AUDIO}
                    isActive={state.status === AppStatus.TRANSCRIBING}
                    isError={state.status === AppStatus.ERROR}
                  />
                  <ProcessingStep 
                    label="Generando Voz Neural" 
                    isCompleted={false} // Would be success state
                    isActive={state.status === AppStatus.GENERATING_AUDIO}
                    isError={state.status === AppStatus.ERROR}
                  />
                </div>
                
                {state.status === AppStatus.ERROR && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200">
                     <AlertCircle className="w-5 h-5 shrink-0" />
                     <p>{state.message}</p>
                     <button onClick={resetApp} className="ml-auto text-sm underline hover:text-white">Intentar de nuevo</button>
                   </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && state.status === AppStatus.SUCCESS && (
          <ResultCard result={result} onReset={resetApp} />
        )}

      </main>

      <footer className="p-6 text-center text-slate-600 text-sm">
        <p>© 2024 EcoDub AI. Built with Gemini 2.5 Flash & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;