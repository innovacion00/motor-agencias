import React, { useEffect, useState } from 'react'
import { infoHotelGeneral } from './bdInfo'
import styles from './styles/infoHoteles.module.css'

const InfoHoteles = () => {
    const [InfoHoteles, setInfoHoteles] = useState([])

    useEffect(() => {
        setInfoHoteles(infoHotelGeneral)
    }, [])

    console.log(InfoHoteles)

    return (
        <>
            <div className={styles.hotel}>
                <img
                    alt="Hotel Avexi Suites"
                    height="200"
                    src="https://www.gehsuites.com/images/fachada_avexi.jpg"
                    width="300"
                />
                <div className={styles.info}>
                    <div className={styles.hotel_header}>
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/logoavexi.png"
                            alt="logo_hotel"
                            className={styles.hotel_logo}
                        />
                        <h3>Hotel Avexi Suites</h3>
                    </div>
                    <div className={styles.icons}>
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconplaya.png"
                            alt="icon_playa"
                            width="24"
                            height="24"
                        />
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconcoffee.png"
                            alt="icon_coffee"
                            width="24"
                            height="24"
                        />
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconparking.png"
                            alt="icon_parking"
                            width="24"
                            height="24"
                        />
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/iconvan.png"
                            alt="icon_van"
                            width="24"
                            height="24"
                        />
                        <img
                            src="https://space-img.sfo3.digitaloceanspaces.com/Agencias/pet-friendly-black-glyph-ui-icon-vector-45097836-Photoroom.png"
                            alt="icon_van"
                            width="24"
                            height="24"
                        />
                    </div>

                    <div className={styles.button}>
                        <a href="/infoavexi"> <button>Ver hotel</button></a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InfoHoteles