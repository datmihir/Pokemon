import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const defaultBackgroundImage = 'https://i0.wp.com/www.vooks.net/img/2016/02/pokemonlogo.jpg?fit=1000%2C562&ssl=1'; 

const App = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(defaultBackgroundImage);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    const fetchPokemon = async (page) => {
      setLoading(true);
      try {
        const offset = (page - 1) * pageSize;
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`);
        const pokemonData = await Promise.all(
          response.data.results.map(async (poke) => {
            const pokeDetails = await axios.get(poke.url);
            return {
              ...poke,
              sprite: pokeDetails.data.sprites.front_default,
              details: pokeDetails.data
            };
          })
        );
        setPokemon(pokemonData);
        setTotalPages(Math.ceil(10000 / pageSize));
        setError(null);
      } catch (err) {
        setError('Failed to fetch Pokémon data.');
      }
      setLoading(false);
    };

    fetchPokemon(currentPage);
  }, [currentPage]);

  const openCard = (poke) => {
    setSelectedPokemon(poke);
    setBackgroundImage(poke.sprite || 'default_background_image_url'); 
  };
  

  const closeCard = () => {
    setSelectedPokemon(null);
    setBackgroundImage(defaultBackgroundImage); 
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const searchPokemon = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchError(null);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`);
      const newPokemon = {
        name: response.data.name,
        sprite: response.data.sprites.front_default,
        details: response.data
      };
      setPokemon([newPokemon]);
      setSearchQuery('');
    } catch (err) {
      setSearchError('Pokémon not found. Please check the name or ID.');
    }
    setLoading(false);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      {/* Background Container */}
      <div
        className="background-container"
        style={{
          backgroundImage: `url(${backgroundImage || defaultBackgroundImage})`, 
        }}
      ></div>

      <div className="content">
        <h1>Pokémon Characters</h1>

        <form className="search-form" onSubmit={searchPokemon}>
          <input
            type="text"
            placeholder="Search Pokémon by name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button type="submit">Search</button>
        </form>

        {searchError && <div className="error">{searchError}</div>}

        <div className="pokemon-list">
          {pokemon.map((poke, index) => (
            <div
              key={index}
              className="pokemon-card"
              onClick={() => openCard(poke)}
            >
              <img src={poke.sprite} alt={poke.name} />
              <h2>{poke.name}</h2>
            </div>
          ))}
        </div>

        {selectedPokemon && (
          <div className="floating-card" style={{ backgroundColor: '#f0f0f0' }}>
            <span className="close" onClick={closeCard}>&times;</span>
            <h2>{selectedPokemon.name}</h2>
            <img src={selectedPokemon.sprite} alt={selectedPokemon.name} />
            <p><strong>Height:</strong> {selectedPokemon.details.height / 10} m</p>
            <p><strong>Weight:</strong> {selectedPokemon.details.weight / 10} kg</p>
            <p><strong>Base Experience:</strong> {selectedPokemon.details.base_experience}</p>
            <p><strong>Abilities:</strong> {selectedPokemon.details.abilities.map(ability => ability.ability.name).join(', ')}</p>
          </div>
        )}

        <div className="pagination">
          <button onClick={goToPreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
