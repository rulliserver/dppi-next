'use client';
import { useEffect, useRef, useState, } from 'react';
import 'datatables.net-dt';
import $ from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
import { UrlApi } from '@/app/Components/apiUrl';
import { useUser } from '@/app/Components/UserContext';
import FormatLongDate from '@/app/Components/FormatLongDate';
import { BaseUrl } from '@/app/Components/baseUrl';
import { downloadIdCardPDF } from '@/app/Components/IdCard';
import QRCode from 'qrcode';
export default function IdCard() {
    const { user } = useUser();
    const [pdp, setPdp]: any = useState();
    //fetching Contact
    const [ketum, setKetum]: any = useState();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    const [loading, setLoading]: any = useState(false);
    const getPdp = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/pdp/${user?.id_pdp}`, {
            withCredentials: true
        });
        setPdp(response.data)
    }
    const getKetum = async () => {
        const response: any = await axios.get(`${UrlApi}/userpanel/ketum`, {
            withCredentials: true
        });
        setKetum(response.data[0])
    }

    useEffect(() => {
        getPdp()
        getKetum()
    }, [])


    useEffect(() => {
        if (!user?.id_pdp) return;
        const targetUrl = `https://dppi.bpip.go.id/id-card/download/${user.id_pdp}`;
        QRCode.toDataURL(targetUrl, {
            errorCorrectionLevel: 'M',
            margin: 1,
            scale: 6,          // ~220px; sesuaikan dengan ukuran img
        })
            .then(setQrDataUrl)
            .catch(() => setQrDataUrl(''));
    }, [user?.id_pdp]);

    //TABEL
    const tableRef: any = useRef(null);
    const datatableRef: any = useRef(null);
    const columns = [
        { data: null, defaultContent: '', orderable: false },
        { data: 'kode_pendaftaran' },
        { data: 'nama_pdp' },
        { data: 'waktu_pelaksanaan' },
        { data: 'biaya' },
        { data: 'bukti_pembayaran' },
        { data: 'jumlah_pembayaran' },
        { data: 'status' },
    ];

    useEffect(() => {
        if (datatableRef.current) {
            datatableRef.current.destroy();
        }
        datatableRef.current = $(tableRef.current).DataTable({
            data: pdp,
            columns: columns,
            createdRow: function (row, data, dataIndex) {
                $(row)
                    .find('td')
                    .first()
                    .text(dataIndex + 1);
            },
        });
    }, [pdp]);


    const targetUrl = `https://dppi.bpip.go.id/id-card/download/${user?.id_pdp}`;

    // Generate QR jadi Data URL (base64)
    const downloadPdf = async () => {
        await downloadIdCardPDF({
            pdp: {
                no_simental: pdp.no_simental,
                nama_lengkap: pdp.nama_lengkap,
                tempat_lahir: pdp.tempat_lahir,
                tgl_lahir: pdp.tgl_lahir,
                alamat: pdp.alamat,
                tingkat_penugasan: pdp.tingkat_penugasan,
                kabupaten: pdp.kabupaten,
                provinsi: pdp.provinsi
            },
            ketum: ketum?.nama_lengkap,
            photo: BaseUrl + pdp.photo,
            bg: '/assets/images/bg-card.jpg',
            logoLeft: '/assets/images/logo-dppi.png',
            logoRight: '/assets/images/logo-smart.png',
            cap: '/assets/images/cap-dppi.png',
            ttd: '/assets/images/ttd.png',
            qr: qrDataUrl,
            printedAt: FormatLongDate(Date())
        });

    };

    return (
        <>
            <div className='py-4'>
                <div className='text-gray-9000 flex flex-row justify-between'>
                    <div className='flex flex-row justify-between w-full'>
                        <div className='flex flex-row'>
                            <i className='text-accent fas fa-calendar-check text-2xl md:text-3xl pr-1 md:pr-5'></i>
                            <p className='md:text-2xl py-1 font-semibold text-accent'>ID CARD</p>
                        </div>
                        <button onClick={downloadPdf} className='mr-4 bg-green-600 text-white py-2 px-4 rounded-md'>Download ID Card</button>
                        {/* <a href={`/id-card/download/${pdp?.id}`} target='_blank' className='mr-4 bg-green-600 text-white py-2 px-4 rounded-md'>
                            Download ID Card
                        </a> */}
                    </div>
                </div>
            </div>

            {pdp ?

                <div className='2xl:flex 2xl:flex-row'>
                    <div className='relative p-0 overflow-hidden rounded-md mb-4 mr-4'>
                        <div className='w-[348px] h-56 md:w-[522px] md:h-[336px] lg:w-[696px] lg:h-[448px] overflow-hidden'>
                            <div style={{ backgroundImage: 'url("/assets/images/bg-card.jpg")', backgroundSize: 'cover', width: '100%', height: '100%' }}>
                                <div className='bg-red w-full h-[28%] bg-red-800 p-2'>
                                    <div className='flex flex-row justify-between'>
                                        <img
                                            src='/assets/images/logo-dppi.png'
                                            className='w-[52.2px] md:w-[78.3px] lg:w-[104.4px] h-[52.2px] md:h-[78.3px] lg:h-[104.4px]'
                                            alt='Logo DPPI'
                                        />
                                        <div>
                                            <p className='md:text-2xl lg:text-4xl text-[1rem] my-auto text-white font-bold'>KARTU ANGGOTA</p>
                                            <p className='md:text-lg lg:text-xl text-[0.55rem] my-auto text-white font-bold'>DUTA PANCASILA PURNA PASKIBRAKA</p>
                                            <p className='md:text-sm lg:text-lg text-[0.50rem] my-auto text-white'>Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110</p>
                                        </div>
                                        <img
                                            src='/assets/images/logo-smart.png'
                                            className='w-[52.2px] md:w-[78.3px] lg:w-[104.4px] h-[52.2px] md:h-[78.3px] lg:h-[104.4px]'
                                            alt='Logo SMART'
                                        />
                                    </div>
                                </div>
                                <div className='p-4 relative'>
                                    <div className='flex flex-row'>
                                        <div className=''>
                                            <img src={`${BaseUrl}${pdp.photo}`} className='w-[87px] md:w-[130.5px] lg:w-[174px]' alt='Foto Diri' />
                                            <p className='text-[0.45rem] md:text-[0.55rem] lg:text-xs text-center'>
                                                Tanggal Cetak <br />
                                                {(() => {
                                                    const date = new Date();
                                                    return FormatLongDate(date);
                                                })()}
                                            </p>
                                        </div>

                                        <div className='flex flex-col ml-1 relative'>
                                            <table className='w-full'>
                                                <tbody className='w-full'>
                                                    <tr>
                                                        <td className='md:text-base lg:text-xl text-[0.55rem] text-black font-bold'>NRA</td>
                                                        <td className='md:text-base lg:text-xl text-[0.55rem] text-black font-bold'>&nbsp;:</td>
                                                        <td className='md:text-base lg:text-xl text-[0.55rem] text-black font-bold'>{pdp.no_simental}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className='label-card'>Nama</td>
                                                        <td className='label-card'>&nbsp;:</td>
                                                        <td className='label-card'>{pdp.nama_lengkap}</td>
                                                    </tr>

                                                    <tr>
                                                        <td className='label-card'>Kelahiran</td>
                                                        <td className='label-card'>&nbsp;:</td>
                                                        <td className='label-card'>
                                                            {pdp.tempat_lahir}, {FormatLongDate(pdp.tgl_lahir)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className='label-card'>Alamat</td>
                                                        <td className='label-card'>&nbsp;:</td>
                                                        <td className='label-card'>{pdp.alamat}</td>
                                                    </tr>

                                                    <tr>
                                                        <td className='label-card whitespace-nowrap'>Asal Daerah</td>
                                                        <td className='label-card'>&nbsp;:</td>
                                                        <td className='label-card'>
                                                            {pdp.tingkat_penugasan == 'Paskibraka Tingkat Kabupaten/Kota' ? pdp.kabupaten : pdp.provinsi}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className='label-card whitespace-nowrap'>Masa Berlaku</td>
                                                        <td className='label-card'>&nbsp;: &nbsp;</td>
                                                        <td className='label-card'>Selama menjadi Anggota</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className='absolute bottom-2 right-4'>
                                        <img src={`/next-api/qr?t=${encodeURIComponent(targetUrl)}`} alt="QR" className="w-12 md:w-20 lg:w-28" />

                                        {/* <img
                                            src={qrDataUrl || '/assets/images/qr-fallback.png'} //
                                            className="w-12 md:w-20 lg:w-28"
                                            alt="QR Code"
                                        /> */}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='relative p-0 overflow-hidden rounded-md mb-2'>
                        <div className='w-[348px] h-56 md:w-[522px] md:h-[336px] lg:w-[696px] lg:h-[448px] overflow-hidden'>
                            <div
                                style={{
                                    backgroundImage: 'url("/assets/images/bg-card.jpg")',
                                    backgroundSize: 'cover',
                                    width: '100%',
                                    height: '100%',
                                }}>
                                <div className='bg-red w-full h-4 bg-red-800 p-2'></div>
                                <div className='p-4 relative'>
                                    <div className='text-[0.5rem] md:text-xs lg:text-base'>
                                        <ol className='px-2'>
                                            <li>
                                                Kartu Anggota merupakan tanda atau bukti bahwa nama yang tertera telah terdaftar sebagai anggota Duta Pancasila Purnapaskibraka
                                                Indonesia
                                            </li>
                                            <li>
                                                Pemegang Kartu Anggota ini wajib menjaga harkat dan martabat serta nama baik organisasi Duta Pancasila Purnapaskibraka Indonesia
                                            </li>
                                            <li>Penyalahgunaan Kartu Anggota ini akan dikenakan sanksi sesuai peraturan yang berlaku</li>
                                            <li>Barang siapa yang menemukan Kartu Anggota ini harap dikembalikan ke alamat berikut:</li>
                                            <div className='font-semibold ml-5'>
                                                <p>Sekretariat Duta Pancasila Purnapaskibraka Indonesia</p>
                                                <p>Jl. Veteran III No. 22, Gambir, DKI Jakarta - 10110</p>
                                            </div>
                                        </ol>
                                    </div>
                                    <div className='absolute -translate-y-1 md:-bottom-[7em] lg:-bottom-[9.2em] right-10 md:right-22 '>
                                        <p className='font-semibold text-[0.5em] md:text-xs xl:text-base'>Ketua Umum DPPI</p>
                                        <img src={`/assets/images/cap-dppi.png`} className='w-12 md:w-20 lg:w-28' alt='cap' />
                                        <p className='font-semibold text-[0.5em] md:text-xs xl:text-base'>{ketum && ketum.nama_lengkap}</p>
                                    </div>
                                    <div className='absolute -translate-y-1 -bottom-8 md:-bottom-[5em] lg:-bottom-[7em] right-14 md:right-16 lg:right-20'>
                                        <img src={`/assets/images/ttd.png`} className='w-16 md:w-28 lg:w-36' alt='ttd' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : ''}
        </>
    );
}
