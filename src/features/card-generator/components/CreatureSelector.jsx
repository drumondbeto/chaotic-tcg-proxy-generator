// Creature selector for the card generator feature
import React, { useState, useEffect, useRef, memo } from 'react';
import { getAllCreatureNames, getCreatureById } from '../data/CreatureDatabase';
import { useLocale } from '../../../app/LocaleContext';


// Use React.memo to prevent unnecessary re-renders
const CreatureSelector = memo(({ onSelectCreature }) => {
  const { locale } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCreatures, setFilteredCreatures] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  // Cache all creatures to avoid recalculation
  const allCreatures = useRef([]);
  
  // Load creatures in alphabetical order
  useEffect(() => {
    const loadCreatures = async () => {
      const creatures = getAllCreatureNames(locale);
      
      // Filter out creatures without a displayName property first
      const validCreatures = creatures.filter(creature => creature && creature.displayName);
      
      // Sort creatures alphabetically
      const sortedCreatures = validCreatures.sort((a, b) => 
        a.displayName.localeCompare(b.displayName)
      );
      
      allCreatures.current = sortedCreatures;
      setFilteredCreatures(sortedCreatures);
    };
    
    loadCreatures();
  }, []);
  
  // Filter creatures when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCreatures(allCreatures.current);
    } else {
      const filtered = allCreatures.current.filter(creature => {
        // Ensure creature has displayName property
        if (!creature || !creature.displayName) return false;
        
        return creature.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      setFilteredCreatures(filtered);
    }
    // Reset selected index when filtered results change
    setSelectedIndex(-1);
  }, [searchTerm]);

  // Memoize the selection handler to avoid recreating during renders
  const handleCreatureSelection = React.useCallback((creatureId) => {
    // Get the full creature data from the database
    const creatureData = getCreatureById(creatureId, locale);
    if (!creatureData) {
      console.error(`Creature not found with ID: ${creatureId}`);
      return;
    }
    
    // Process loyalty restrictions based on tribe
    let loyalRestriction = '';

    const loyalRestrictionText = locale === 'pt' ? 'M\'arrillians ou Lacaios' : 'M\'arrillians or Minions';
    // Only set a loyalty restriction for M'arrillians
    if (creatureData.tribe && creatureData.tribe.toLowerCase() === 'm\'arrillian') {
      loyalRestriction = loyalRestrictionText;
    }
    
    // Call the parent component's handler with creature id and loyalty restriction
    onSelectCreature(creatureId, loyalRestriction);
    
    // Reset local state
    setIsDropdownOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
    
    // Re-focus input after a small delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [onSelectCreature]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  // Get a flattened list of selectable creatures
  const getSelectableCreatures = () => {
    return filteredCreatures;
  };

  // Special key handler with focus lock
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!isDropdownOpen) return;
      
      const selectableCreatures = getSelectableCreatures();
      
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        
        switch (e.key) {
          case 'ArrowDown':
            setSelectedIndex(prevIndex => {
              if (prevIndex < selectableCreatures.length - 1) {
                // Move selection down
                const newIndex = prevIndex + 1;
                scrollToIndex(newIndex, selectableCreatures);
                return newIndex;
              }
              return prevIndex;
            });
            break;
            
          case 'ArrowUp':
            setSelectedIndex(prevIndex => {
              if (prevIndex > 0) {
                // Move selection up
                const newIndex = prevIndex - 1;
                scrollToIndex(newIndex, selectableCreatures);
                return newIndex;
              }
              return prevIndex;
            });
            break;
            
          case 'Enter':
            if (selectedIndex >= 0 && selectedIndex < selectableCreatures.length) {
              // Select the highlighted creature
              handleCreatureSelection(selectableCreatures[selectedIndex].id);
            }
            break;
            
          case 'Escape':
            // Close the dropdown
            setIsDropdownOpen(false);
            setSelectedIndex(-1);
            break;
        }
      }
    };
    
    if (isDropdownOpen) {
      // Only add listener when dropdown is open
      document.addEventListener('keydown', handleGlobalKeyDown, true);
    }
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, [isDropdownOpen, selectedIndex, filteredCreatures, handleCreatureSelection]);

  // Initialize dropdown state with first item selected
  useEffect(() => {
    if (isDropdownOpen && selectedIndex === -1) {
      const selectableCreatures = getSelectableCreatures();
      if (selectableCreatures.length > 0) {
        setSelectedIndex(0);
      }
    }
  }, [isDropdownOpen, selectedIndex, filteredCreatures]);

  // Function to scroll to a specific index
  const scrollToIndex = (index, selectableCreatures) => {
    if (index < 0 || !listRef.current) return;
    
    // Use setTimeout to ensure this runs after render
    setTimeout(() => {
      const creatureId = selectableCreatures[index]?.id;
      if (!creatureId) return;
      
      const element = listRef.current.querySelector(`[data-id="${creatureId.replace(/"/g, '\\"')}"]`);
      if (element) {
        element.scrollIntoView({
          block: 'nearest',
          behavior: 'auto'
        });
      }
    }, 0);
  };

  // Add focus handler for accessibility
  const handleInputFocus = () => {
    // Don't auto-open, but prepare for keyboard navigation
    if (isDropdownOpen) {
      const selectableCreatures = getSelectableCreatures();
      if (selectableCreatures.length > 0 && selectedIndex === -1) {
        setSelectedIndex(0);
      }
    }
  };

  // Helper to find if a creature is currently selected
  const isSelected = (creature) => {
    if (selectedIndex === -1) return false;
    
    const selectableCreatures = getSelectableCreatures();
    return selectableCreatures[selectedIndex]?.id === creature.id;
  };

  // Combined input click and focus handler
  const handleInputClick = () => {
    setIsDropdownOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-white font-bold">Select Creature</label>
          <span className="text-xs text-gray-400">
            {getSelectableCreatures().length} creatures available
          </span>
        </div>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            onKeyDown={(e) => {
              // Only handle special keys to open dropdown
              if (e.key === 'ArrowDown' || e.key === 'Enter') {
                if (!isDropdownOpen) {
                  e.preventDefault();
                  setIsDropdownOpen(true);
                }
              }
            }}
            placeholder="Search creatures..."
            className="w-full p-2 border border-gray-700 rounded bg-black text-white focus:border-[#9FE240] focus:outline-none pl-8"
            autoComplete="off"
            aria-expanded={isDropdownOpen}
          />
          
          {/* Search icon */}
          <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {isDropdownOpen && (
            <div 
              ref={listRef}
              className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-80 overflow-y-auto"
              role="listbox"
              tabIndex="-1"
            >
              {filteredCreatures.length === 0 ? (
                <div className="p-3 text-gray-400 text-center">No creatures found</div>
              ) : (
                <div className="creature-list">
                  {filteredCreatures.map((creature) => (
                    creature && creature.displayName && creature.id ? (
                      <div
                        key={creature.id}
                        data-id={creature.id}
                        className={`p-2 cursor-pointer border-t border-gray-700 first:border-0 creature-item ${
                          isSelected(creature) ? 'bg-gray-700' : 'hover:bg-gray-800'
                        }`}
                        onClick={() => handleCreatureSelection(creature.id)}
                        role="option"
                        aria-selected={isSelected(creature)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white">{creature.displayName}</div>
                            {/* You can add additional creature details here if needed */}
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {/* Try all possible ways the set might be stored */}
                            {creature.setDisplay || 
                             (creature.set && creature.set.toUpperCase()) || 
                             creature.expansionDisplay || 
                             (creature.expansion && creature.expansion.toUpperCase()) ||
                             (creature.releaseSet && creature.releaseSet.toUpperCase()) ||
                             (creature.release && creature.release.toUpperCase()) ||
                             (creature.collection && creature.collection.toUpperCase()) ||
                             (creature.isPast ? "PAST" : "")}
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Export with display name for better debugging
CreatureSelector.displayName = 'CreatureSelector';

export default CreatureSelector;