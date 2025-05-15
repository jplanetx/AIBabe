import React from 'react';
import {
  FlaskConical,
  Castle,
  MessageCircle,
  Brain,
  Leaf,
  Mountain,
  Gamepad,
  Film,
  Book
} from 'lucide-react';

// Define a mapping of interests to their corresponding icons.
// The iconMap is explicitly typed as Record<string, JSX.Element> for type safety.
const iconMap: Record<string, JSX.Element> = {
  "Deep conversations": <MessageCircle className="h-4 w-4" />,
  "Psychology": <Brain className="h-4 w-4" />,
  "Cooking": <Leaf className="h-4 w-4" />,
  "Nature walks": <Mountain className="h-4 w-4" />,
  "Classic literature": <Book className="h-4 w-4" />,
  "Games": <Gamepad className="h-4 w-4" />,
  "Science": <FlaskConical className="h-4 w-4" />,
  "Philosophy": <Brain className="h-4 w-4" />,
  "Documentaries": <Film className="h-4 w-4" />,
  "Chess": <Castle className="h-4 w-4" />
};

interface CharacterPageProps {
  params: {
    id: string;
  };
}

// The CharacterPage component displays the character id and a list of interests with icons.
export default function CharacterPage({ params }: CharacterPageProps) {
  return (
    <div>
      <h1>Character {params.id}</h1>
      <div>
        {Object.entries(iconMap).map(([interest, icon]: [string, JSX.Element]) => (
          <div key={interest}>
            <span>{interest}</span>
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}