import { useEffect, useState } from 'react';
import Button from './components/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CustomCheckbox from './components/CustomCheckbox';
import { useAlert, AlertProvider } from './components/AlertContext';

const Generator = () => {
    const savedOptions = JSON.parse(localStorage.getItem("genpassOptions") || '{}');
    const [password, setPassword] = useState('');
    const [passwordFileURL, setPasswordFileURL] = useState<string>('');
    const [numOptions, setNumOptions] = useState(savedOptions.numOptions ?? 2);
    const [passwordLength, setPasswordLength] = useState(savedOptions.passwordLength ?? 12);
    const [segmentCount, setSegmentCount] = useState(savedOptions.segmentCount ?? 3);
    const [useSegments, setUseSegments] = useState(savedOptions.useSegments ?? true);
    const [useCustomList, setUseCustomList] = useState(savedOptions.useCustomList ?? false);
    const [useDefaultList, setUseDefaultList] = useState(savedOptions.useDefaultList ?? true);
    const [replaceChars, setReplaceChars] = useState(savedOptions.replaceChars ?? true);
    const [isAdvanced, setIsAdvanced] = useState(savedOptions.isAdvanced ?? false);
    const [includeNumbers, setIncludeNumbers] = useState(savedOptions.includeNumbers ?? false);
    const [includeSymbols, setIncludeSymbols] = useState(savedOptions.includeSymbols ?? false);
    const [includeUppercase, setIncludeUppercase] = useState(savedOptions.includeUppercase ?? false);
    const [passwordAmount, setPasswordAmount] = useState(1);
    const [passwordStrength, setPasswordStrength] = useState('');
    const { addAlert } = useAlert();

    useEffect(() => {
        const opts = { numOptions, passwordLength, segmentCount, useSegments, useCustomList, useDefaultList, replaceChars, isAdvanced, includeNumbers, includeSymbols, includeUppercase, passwordAmount };
        localStorage.setItem("genpassOptions", JSON.stringify(opts));
    }, [numOptions, passwordLength, segmentCount, useSegments, useCustomList, useDefaultList, replaceChars, isAdvanced, includeNumbers, includeSymbols, includeUppercase, passwordAmount]);









    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[85vh] bg-neutral-900 text-white p-6 my-16 overflow-y-auto">
            <div className='max-w-3xl mx-auto bg-neutral-800 shadow-lg rounded-lg p-8'>
                <h1 className="text-4xl font-bold mb-6">Password Generator</h1>
                {isAdvanced ? (
                    <Button onClick={() => setIsAdvanced(false)} className="mb-4 border-indigo-500 bg-indigo-500/10">
                        Back to Simple Mode
                    </Button>
                ) : (
                    <Button onClick={() => setIsAdvanced(true)} className="mb-4 border-indigo-500 bg-indigo-500/10">
                        Advanced Mode
                    </Button>
                )}
                <div className="mb-4">
                    <Typography id="passwordAmount" gutterBottom>
                        Number of Passwords: {passwordAmount}
                    </Typography>
                    <TextField
                        id="outlined-size-small"
                        value={passwordAmount}
                        onChange={(e) => setPasswordAmount(parseInt(e.target.value))}
                        aria-labelledby="passwordAmount"
                        type="number"
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                        }}
                        className="bg-white rounded-sm"
                    />
                </div>
                {isAdvanced ? (
                    <div>
                        <div className="mb-4">
                            <CustomCheckbox checked={useSegments} onChange={() => setUseSegments(!useSegments)} label="Use Segments" />
                            {useSegments ? (
                                <>
                                    <Typography id="segmentCount" gutterBottom>
                                        Amount of segments: {segmentCount}
                                    </Typography>
                                    <Slider
                                        value={segmentCount}
                                        onChange={(_e, value) => setSegmentCount(value as number)}
                                        aria-labelledby="segmentCount"
                                        min={2}
                                        max={6}
                                        valueLabelDisplay="auto"
                                        sx={{ color: 'white' }}
                                    />
                                </>
                            ) : (
                                <>
                                    <Typography id="passwordLength" gutterBottom>
                                        Password Length: {passwordLength}
                                    </Typography>
                                    <Slider
                                        value={passwordLength}
                                        onChange={(_e, value) => setPasswordLength(value as number)}
                                        aria-labelledby="passwordLength"
                                        min={8}
                                        max={32}
                                        valueLabelDisplay="auto"
                                        sx={{ color: 'white' }}
                                    />
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <CustomCheckbox checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} label="Include Numbers" />
                            <CustomCheckbox checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} label="Include Symbols" />
                            <CustomCheckbox checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} label="Include Uppercase Letters" />
                        </div>

                    </div>
                ) : (
                    <div>
                        <div className="mb-4">
                            <Typography id="numOptions" gutterBottom>
                                Number of words : {numOptions}
                            </Typography>
                            <Slider
                                value={numOptions}
                                onChange={(_e, value) => setNumOptions(value as number)}
                                aria-labelledby="numOptions"
                                min={1}
                                max={5}
                                valueLabelDisplay="auto"
                                sx={{ color: 'white' }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <CustomCheckbox checked={useDefaultList} onChange={() => setUseDefaultList(!useDefaultList)} label="Use Default Words" />
                            <CustomCheckbox checked={useCustomList} onChange={() => setUseCustomList(!useCustomList)} label="Use Custom Words" />
                            <CustomCheckbox checked={replaceChars} onChange={() => setReplaceChars(!replaceChars)} label="Use Special Characters" />
                        </div>

                    </div>
                )}
            </div>
            {password && (
                <div className="max-w-3xl mx-auto bg-neutral-800 shadow-lg rounded-lg p-8 mt-8 md:mt-0">
                    <h2 className="text-xl font-bold">Generated Password(s):</h2>
                    <pre className="max-h-[50vh] overflow-y-auto bg-indigo-500/20 border-dashed border-white border-2 text-white font-bold py-3 px-6 rounded-lg mt-4 whitespace-pre-wrap">
                        {password}
                    </pre>
                    <div className="flex space-x-4 mt-4">

                        {passwordFileURL && (
                            <Button onClick={() => { }} className="bg-orange-500/10 border-orange-500">
                                <a href={passwordFileURL} download="passwords.txt">
                                    Download Password(s)
                                </a>
                            </Button>
                        )}
                    </div>
                    <div className={`mt-2 text-lg font-bold ${passwordStrength === 'Weak'
                        ? 'text-red-500'
                        : passwordStrength === 'Moderate'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                        }`}>
                        Strength: {passwordStrength}
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => (
    <AlertProvider>
        <Generator />
    </AlertProvider>
);

export default App;