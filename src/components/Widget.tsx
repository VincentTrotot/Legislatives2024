import { Fragment } from "react/jsx-runtime";
import { useElectionResults } from "../hooks/useElectionResults";
import "./Widget.css";

function Widget() {
    const { nuances, nombreFilesFetched } = useElectionResults();

    const max = 577;

    return (
        <>
            <div className="container">
                <div className="widget">
                    <main className="main">
                        {nuances.map((nuance, index) => (
                            <Fragment key={index}>
                                <div
                                    className="nuance__bar"
                                    style={{
                                        height: `${
                                            (nuance.nombreQualifies / max) * 100
                                        }%`,
                                        gridArea: `bar${index}`,
                                        backgroundColor: `${nuance.couleur}`,
                                    }}
                                ></div>

                                <div
                                    className={`nuance__lib nuance${index}`}
                                    style={{ gridArea: `nuance${index}` }}
                                >
                                    <div>{nuance.libelle}</div>
                                    <div className="nb-qualifies">
                                        {nuance.nombreQualifies} qualifié·e
                                        {nuance.nombreQualifies > 1 ? "s" : ""}
                                    </div>
                                </div>
                            </Fragment>
                        ))}
                    </main>
                    <footer className="footer">
                        {nombreFilesFetched} / 107 département
                        {nombreFilesFetched > 1 ? "s" : ""}, DROM-COM et
                        territoire
                        {nombreFilesFetched > 1 ? "s" : ""} dépouillé
                        {nombreFilesFetched > 1 ? "s" : ""}.
                    </footer>
                </div>
            </div>
        </>
    );
}

export default Widget;
