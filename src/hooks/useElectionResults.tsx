import { useEffect, useRef, useState } from "react";
import { Nuance, DataFile } from "../types/types";
import { NUANCES, FILES } from "../assets/const";

export const useElectionResults = () => {
    const { nuances, incrementNombreQualifies } = useNuances();
    const { files, markFileAsFetched } = useFiles();

    const controllerRef = useRef<AbortController>();

    useEffect(() => {
        /**
         * Helper pour parser le xml
         * @param text Response.text du ministère
         */
        const xmlToCandidate = (text: string) => {
            const xml = new DOMParser()
                .parseFromString(text, "text/xml")
                .getElementsByTagName("Circonscription");
            for (let i = 0; i < xml.length; i++) {
                const circonscription = xml[i];
                const canditates_in_circonscription =
                    circonscription.getElementsByTagName("Candidat");

                for (let j = 0; j < canditates_in_circonscription.length; j++) {
                    const elu =
                        canditates_in_circonscription[j].getElementsByTagName(
                            "Elu"
                        )[0].textContent;

                    if (elu && ["QUALIF T2", "OUI"].includes(elu)) {
                        const code =
                            canditates_in_circonscription[
                                j
                            ].getElementsByTagName("CodNuaCand")[0].textContent;

                        if (code) {
                            incrementNombreQualifies(code);
                        }
                    }
                }
            }
        };

        /**
         * Fetch tous les fichiers dont on a pas encore obtenu le resultat
         * (c'est-à-dire ceux dont le fetch précédent à échoué)
         */
        const resultsFetcher = async () => {
            controllerRef.current = new AbortController();
            const signal = controllerRef.current.signal;

            for (const file of files) {
                if (file.fetched) continue;

                try {
                    const response = await fetch(file.url, { signal });
                    if (!response.ok) {
                        throw new Error(`File ${file} not found`);
                    }

                    const text = await response?.text();
                    if (!text) continue;

                    xmlToCandidate(text);
                } catch (error) {
                    continue;
                }

                markFileAsFetched(file.url);
            }
        };

        // Première exécution de la fonction
        resultsFetcher();

        // Exécution de la fonction toute les 3 minutes
        const interval = setInterval(() => {
            resultsFetcher();
        }, 3 * 60_000);

        // Nettoyage du useEffect
        return () => {
            // Abort des fetchs en cours
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            // Nettoyage de l'interval
            clearInterval(interval);
        };
    }, [files, markFileAsFetched, incrementNombreQualifies]);

    return {
        nuances: nuances,
        nombreFilesFetched: files.filter((file) => file.fetched).length,
    };
};

const useNuances = () => {
    // Utilisation du localStorage pour ne pas refetchs des résultats déjà obtenus en cas de rechargement de la page
    let nuancesToUse = NUANCES;
    if(localStorage.getItem('nuances') !== null) {
        nuancesToUse = JSON.parse(localStorage.getItem('nuances')!);
    } 
    
    const [nuances, setNuances] = useState<Nuance[]>(nuancesToUse);

    const findCodeNuanceIndex = (codeMinistere: string) => {
        return nuances.findIndex((nuance) =>
            nuance.codesMinistere.includes(codeMinistere)
        );
    };

    const findAutresNuancesIndex = () => {
        return nuances.findIndex((nuance) => nuance.libelle == "Autres");
    };

    /**
     * Ajoute un au nombre de qualifié de la nuance ayant dans ses codes ministères
     * le code passé en paramètre
     *
     * @param codeMinistere string
     */
    const incrementNombreQualifies = (codeMinistere: string) => {
        const updatedNuances = [...nuances];

        // Identification de l'index de la nuance à incrémenter
        const indexNuance = findCodeNuanceIndex(codeMinistere);

        // Incrémentation si la nuance est trouvée
        if (indexNuance !== -1) {
            updatedNuances[indexNuance].nombreQualifies++;
        } else {
            // Incrémentation du groupe "Autres" sinon
            const indexAutresNuances = findAutresNuancesIndex();
            updatedNuances[indexAutresNuances].nombreQualifies++;
        }
        setNuances(updatedNuances);
        localStorage.setItem('nuances', JSON.stringify(updatedNuances));

    };

    return {
        nuances,
        incrementNombreQualifies,
    };
};

const useFiles = () => {
    // Utilisation du localStorage pour ne pas refetchs des résultats déjà obtenus en cas de rechargement de la page
    let filesToUse = FILES;
    if(localStorage.getItem('files') !== null) {
        filesToUse = JSON.parse(localStorage.getItem('files')!);
    }

    const [files, setFiles] = useState<DataFile[]>(filesToUse);

    const markFileAsFetched = (url: string) => {
        const updatedFiles = [...files];

        const indexToUpdate = updatedFiles.findIndex((file) => file.url == url);

        if (indexToUpdate !== -1) {
            updatedFiles[indexToUpdate].fetched = true;
            setFiles(updatedFiles);
        }

        localStorage.setItem('files', JSON.stringify(updatedFiles));
    };

    return {
        files,
        markFileAsFetched,
    };
};
