import React from 'react';

interface HeaderProps {
    chataId: string;
}

export const Header: React.FC<HeaderProps> = ({ chataId }) => {
    return (
        <header className="site-header">
            <div className="header-content">
                <img 
                    className="header-logo" 
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/d/d1/University_College_London_logo.svg/300px-University_College_London_logo.svg.png" 
                    alt="UCL Logo" 
                />
                <h1>CHATA Autism Report Generator</h1>
                <div className="header-right">
                    {chataId && <span className="chata-id">{chataId}</span>}
                    <img 
                        className="header-logo" 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/National_Health_Service_%28England%29_logo.svg/371px-National_Health_Service_%28England%29_logo.svg.png" 
                        alt="NHS Logo" 
                    />
                </div>
            </div>
        </header>
    );
}; 