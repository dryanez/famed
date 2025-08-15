import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from 'lucide-react';

export default function FlashcardEditor({ card, onSave, onCancel }) {
  const [editedCard, setEditedCard] = useState(card || {
    german_text: '',
    english_translation: '',
    difficulty_reason: '',
    category: 'vocabulary',
    mastery_level: 0
  });

  const handleSave = () => {
    if (!editedCard.german_text || !editedCard.english_translation) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    onSave(editedCard);
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader>
        <CardTitle className="text-lg">
          {card ? 'Lernkarte bearbeiten' : 'Neue Lernkarte erstellen'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Deutscher Begriff *</label>
          <Input
            value={editedCard.german_text}
            onChange={(e) => setEditedCard({...editedCard, german_text: e.target.value})}
            placeholder="z.B. Dyspnoe"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Englische Übersetzung *</label>
          <Input
            value={editedCard.english_translation}
            onChange={(e) => setEditedCard({...editedCard, english_translation: e.target.value})}
            placeholder="z.B. Shortness of breath"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Hinweis / Erklärung</label>
          <Textarea
            value={editedCard.difficulty_reason}
            onChange={(e) => setEditedCard({...editedCard, difficulty_reason: e.target.value})}
            placeholder="z.B. Schwierige Aussprache"
            className="h-20"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Kategorie</label>
          <Select 
            value={editedCard.category} 
            onValueChange={(value) => setEditedCard({...editedCard, category: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vocabulary">Vokabular</SelectItem>
              <SelectItem value="pronunciation">Aussprache</SelectItem>
              <SelectItem value="grammar">Grammatik</SelectItem>
              <SelectItem value="fluency">Flüssigkeit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}