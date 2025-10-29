'use client';

import { useEffect, useState } from 'react';
import { UrlApi } from './apiUrl';
import { BaseUrl } from './baseUrl';
import { useKeenSlider, KeenSliderInstance } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface EventData {
	poster_event: string;
	nama_event?: string;
}

export default function EventWisata() {
	const [events, setEvents] = useState<EventData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentSlide, setCurrentSlide] = useState<number>(0);

	const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
		{
			loop: true,
			slides: { perView: 1 }, // 🔥 selalu 1 gambar per slide
			slideChanged(slider) {
				setCurrentSlide(slider.track.details.rel);
			}
		},
		[
			(slider: KeenSliderInstance) => {
				let timeout: ReturnType<typeof setTimeout>;
				let mouseOver = false;
				function clearNextTimeout() {
					clearTimeout(timeout);
				}
				function nextTimeout() {
					clearTimeout(timeout);
					if (mouseOver) return;
					timeout = setTimeout(() => {
						slider.next();
					}, 8000);
				}
				slider.on('created', () => {
					slider.container.addEventListener('mouseover', () => {
						mouseOver = true;
						clearNextTimeout();
					});
					slider.container.addEventListener('mouseout', () => {
						mouseOver = false;
						nextTimeout();
					});
					nextTimeout();
				});
				slider.on('dragStarted', clearNextTimeout);
				slider.on('animationEnded', nextTimeout);
				slider.on('updated', nextTimeout);
			}
		]
	);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await fetch(`${UrlApi}/events`);
				if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
				const data: EventData[] = await response.json();
				setEvents(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
			} finally {
				setIsLoading(false);
			}
		};
		fetchEvents();
	}, []);

	if (isLoading) {
		return <div className='flex items-center justify-center h-64'>Memuat...</div>;
	}

	if (error) {
		return <div className='flex items-center justify-center h-64 text-red-500'>{error}</div>;
	}

	if (events.length === 0) {
		return <div className='flex items-center justify-center h-64 text-gray-500'>Tidak ada event.</div>;
	}

	return (
		<div className='relative w-full max-w-[1280px] mx-auto'>
			<section className='popular-section'>
				<h2 className='section-title text-2xl font-bold mb-6 text-center'>Event Wisata</h2>

				<div ref={sliderRef} className='keen-slider relative w-full h-[500px] md:h-[600px] lg:h-[700px] rounded-lg overflow-hidden'>
					{events.map((slide, idx) => (
						<div key={idx} className='keen-slider__slide relative w-full h-full'>
							<Image src={`${BaseUrl}/${slide.poster_event}`} alt={slide.nama_event || `Event slide ${idx + 1}`} fill className='object-cover' priority={idx < 2} />
						</div>
					))}

					{/* Tombol navigasi */}
					{instanceRef.current && (
						<>
							<button
								onClick={() => instanceRef.current?.prev()}
								className='absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10'>
								<ChevronLeft size={28} />
							</button>
							<button
								onClick={() => instanceRef.current?.next()}
								className='absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full hover:bg-black/70 transition-colors z-10'>
								<ChevronRight size={28} />
							</button>
						</>
					)}
				</div>

				{/* Dot navigation */}
				{instanceRef.current && (
					<div className='flex justify-center mt-4 space-x-2'>
						{[...Array(instanceRef.current.track.details.slides.length).keys()].map((idx) => (
							<button
								key={idx}
								onClick={() => instanceRef.current?.moveToIdx(idx)}
								className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-black w-6' : 'bg-gray-400 w-2'}`}
							/>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
