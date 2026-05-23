const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');

document.getElementById('restart-btn').addEventListener('click', () => {
    window.location.reload();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    statusDiv.innerText = "Идет сканирование и OCR...";
    statusDiv.style.color = "#555";
    progressBar.style.display = 'block';
    progressFill.style.width = '0%';

    try {
        
        const { data: { text } } = await Tesseract.recognize(
            file, 
            'eng', 
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        progressFill.style.width = `${Math.round(m.progress * 100)}%`;
                        statusDiv.innerText = `Распознавание: ${Math.round(m.progress * 100)}%`;
                    } else {
                        statusDiv.innerText = m.status;
                    }
                },
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'
            }
        );

        console.log("Распознанный текст:\n", text);

        statusDiv.innerText = "Анализ данных MRZ...";
        
        const mrzData = parseMRZ(text);
        
        if (mrzData) {
            populateForm(mrzData);
            statusDiv.innerText = "Успешно! Данные заполнены.";
            statusDiv.style.color = "green";
        } else {
            statusDiv.innerText = "Текст распознан, но MRZ не найден. Попробуйте другое фото.";
            statusDiv.style.color = "orange";
        }

    } catch (error) {
        console.error(error);
        statusDiv.innerText = "Ошибка: " + error.message;
        statusDiv.style.color = "red";
    }
});


function parseMRZ(text) {
    console.log("Raw text:", text);

    const potentialLines = text.split('\n')
        .map(l => l.toUpperCase().replace(/[^A-Z0-9<]/g, '').trim())
        .filter(l => {
            return l.length >= 28 && (l.includes('<') || /\d{5}/.test(l));
        });

    console.log("Отфильтрованные строки MRZ:", potentialLines);

    if (potentialLines.length < 2) return null;

    const avgLength = potentialLines.reduce((a, b) => a + b.length, 0) / potentialLines.length;

    let docType = null;
    let lines = [];

    if (avgLength > 38 && potentialLines.length >= 2) {
        docType = 'PASSPORT';
        lines = potentialLines.slice(-2); 
    } 
    else if (potentialLines.length >= 3) {
        docType = 'ID_CARD';
        lines = potentialLines.slice(-3);
    } 
    else if (potentialLines.length === 2 && avgLength < 38) {

         if(potentialLines[0].startsWith('I') || potentialLines[0].startsWith('A') || potentialLines[0].startsWith('C')) {
             docType = 'ID_CARD_INCOMPLETE';
             lines = potentialLines;
         }
    }

    if (!docType) return null;

    console.log(`Detected: ${docType}`, lines);

    try {
        let surname, names, docNum, country, dob, sex, expiry;

        if (docType === 'PASSPORT') {
            const l1 = lines[0];
            const l2 = lines[1];

            country = l1.substring(2, 5).replace(/</g, '');
            const rawName = l1.substring(5);
            const nameParts = rawName.split('<<');
            surname = nameParts[0].replace(/</g, '');
            names = nameParts[1] ? nameParts[1].split('<')[0].replace(/</g, '') : '';

            docNum = l2.substring(0, 9).replace(/</g, '');
            dob = l2.substring(13, 19);
            sex = l2.substring(20, 21);
            expiry = l2.substring(21, 27);
        } 
        else if (docType === 'ID_CARD') {
            const l1 = lines[0];
            const l2 = lines[1];
            const l3 = lines[2];

            country = l1.substring(2, 5).replace(/</g, '');
            docNum = l1.substring(5, 14).replace(/</g, '');

            dob = l2.substring(0, 6);
            sex = l2.substring(7, 8); 
            expiry = l2.substring(8, 14);

            const nameParts = l3.split('<<');
            surname = nameParts[0].replace(/</g, '');
            names = nameParts[1] ? nameParts[1].split('<')[0].replace(/</g, '') : '';
        }

        return { surname, names, docNum, country, dob, sex, expiry };

    } catch (e) {
        console.error("Parsing logic error:", e);
        return null;
    }
}

function populateForm(data) {
    if (!data) return;
    if(data.surname) document.getElementById('surname').value = data.surname;
    if(data.names) document.getElementById('names').value = data.names;
    if(data.docNum) document.getElementById('docNum').value = data.docNum;
    if(data.country) document.getElementById('country').value = data.country;
    if(data.dob) document.getElementById('dob').value = data.dob;
    if(data.expiry) document.getElementById('expiry').value = data.expiry;
    if(data.sex) document.getElementById('sex').value = data.sex;
}