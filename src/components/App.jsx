import {useState, useEffect} from 'react'
import {Container} from './App.styled.js'
import {getImages} from "../utils/unsplash-api-service.js";
import SearchBar from "./SearchBar/SearchBar.jsx";
import ImageGallery from "./ImageGallery/ImageGallery.jsx";
import LoadMoreBtn from "./LoadMoreBtn/LoadMoreBtn.jsx";
import Loader from "./Loader/Loader.jsx";
import ErrorMessage from "./ErrorMessage/ErrorMessage.jsx";
import ImageModal from "./ImageModal/ImageModal.jsx";
import iziToast from "izitoast";
import 'izitoast/dist/css/iziToast.min.css';
import errorMessage from "./ErrorMessage/ErrorMessage.jsx";

// state machine = idle, pending, reject, resolve
const App = () => {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [state, setState] = useState('idle')
    const [error, setError] = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);

    const onSubmit = (values) => {
        setQuery(values);
    }

    useEffect(() => {
        if (query !== '') {
            setState('pending')
            setError(null);
            setPage(1)
            getImages(query, page).then((res) => {

                if (res.data.total === 0) {
                    throw Error(`images with name ${query} not found`);
                }
                setData(res.data.results);
                setState('resolve')

            }).catch(err => {
                setError(err.message)
                setState('reject')
                iziToast.show({
                    message: err.message,
                    color: 'red'
                })
            });
        }
    }, [query]);

    const onLoadMoreClick = () => {
        setPage(() => page + 1);

        setState('pending')
        setError(null);
        getImages(query, page + 1).then((res) => {
            setData([...data, ...res.data.results])
            console.log(page)
            setState('resolve')
        }).catch(err => {
                setError(err.message)
                setState('reject')
                iziToast.show({
                    message: err.message,
                    color: 'red'
                })
            }
        )
    }

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const getModalImage = (image) => {
        setModalImage(image)
    }

    if (state === 'idle') {
        return <Container>
            <SearchBar onSubmit={onSubmit}/>
        </Container>
    }

    if (state === 'pending' && query ===  '') {
        return <Container>
            <SearchBar onSubmit={onSubmit}/>
            <Loader/>
        </Container>
    }

    if (state === 'resolve' || state === 'pending') {
        return <>
            <Container>
            <SearchBar onSubmit={onSubmit}/>
            <ImageGallery data={data} onImageClick={openModal} getModalImage={getModalImage}/>
                {state === 'pending' ? <Loader/> : <LoadMoreBtn onClick={onLoadMoreClick}/>}
            </Container>
            <ImageModal onRequestClose={closeModal} isOpen={modalIsOpen} image={modalImage}/>
        </>
    }

    if (state === 'reject') {
        return <Container>
            <SearchBar onSubmit={onSubmit}/>
            <ErrorMessage message={error}/>
        </Container>
    }
}

export default App