"use client";

import { useEffect, useState } from "react";
import { BaseUrl } from "./baseUrl";

const STORAGE_KEY = "announcement_seen_at";
const ONE_DAY = 24 * 60 * 60 * 1000;

export default function AnnouncementPopup(pengumuman: any) {
    const [show, setShow] = useState(false);
    const announcement = pengumuman

    useEffect(() => {
        const lastSeen = localStorage.getItem(STORAGE_KEY);

        if (!lastSeen) {
            setShow(true);
            return;
        }

        const diff = Date.now() - Number(lastSeen);
        if (diff > ONE_DAY) {
            setShow(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative w-full max-w-180 bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute md:top-2 md:right-2 top-1 right-1 bg-accent px-1.5 hover:scale-110 ease-in-out rounded-full text-white text-sm md:text-xl font-bold"
                >
                    ✕
                </button>
                <a href={announcement.pengumuman.link} target="_blank" rel="noopener noreferrer">
                    <img
                        src={BaseUrl + announcement.pengumuman.image}
                        alt="pengumuman"
                        className="w-full h-auto"
                    />
                </a>
            </div>
        </div>
    );
}
