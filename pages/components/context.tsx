import { createContext, useContext } from 'react';



export type KmoContextType = {
    folder: any;
    setFolder: (Theme: any) => void;
    db: any;
    setDb: (Theme: any) => void;
}

export const KmoContext = createContext<KmoContextType>({ 
    folder: {}, 
    setFolder: folder => console.warn('no theme provider'),
    db: {}, 
    setDb: folder => console.warn('no theme provider')
});
export const useKmoContext = () => useContext(KmoContext);