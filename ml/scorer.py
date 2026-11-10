import numpy as np
from sklearn.preprocessing import MinMaxScaler

WEIGHTS = {
    'emergency_match': 0.30,
    'icu_availability': 0.25,
    'current_load': 0.20,
    'distance': 0.15,
    'emergency_open': 0.10
}

EMERGENCY_SPECIALIST_MAP ={ 
    'cardiac': 'cardiologist',
    'trauma': 'trauma surgeon',
    'burns': 'burn specialist',
    'stroke': 'neurologist',
    'respiratory': 'pulmonologist',
    'other': 'general'
}

def score_hospitals(hospitals, emergency_type):
    if not hospitals:
        return []

    scored = []

    for hospital in hospitals:
        distance_meters = hospital.get('distanceMeters', 30000)
        available_beds = hospital.get('availableICUBeds', 0)
        total_beds = hospital.get('totalICUBeds', 1)
        current_load = hospital.get('currentLoad', 0)
        emergency_types = hospital.get('emergencyTypes', [])

        bed_availability_ratio = (
            available_beds / total_beds if total_beds > 0 else 0
        )

        target_specialist = EMERGENCY_SPECIALIST_MAP.get(
            emergency_type, 'general'
        )

        specialist_available = any(
            s.get('type') == target_specialist and s.get('available')
            for s in hospital.get('specialists', [])
        )

        emergency_match_score = (
            1.0 if emergency_type in emergency_types else 0.0
        )

        if specialist_available:
            emergency_match_score = min(
                1.0,
                emergency_match_score + 0.3
            )

        scored.append({
            'hospital': hospital,
            'raw_scores': {
                'emergency_match': emergency_match_score,
                'icu_availability': bed_availability_ratio,
                'current_load': current_load,
                'distance': distance_meters,
            }
        })

    return scored

def normalize_and_rank(scored_hospitals):
    if not scored_hospitals:
        return[]
    
    if len(scored_hospitals)==1:
        hospital = scored_hospitals[0]
        hospital['hospital']['hlers_score']=85.0
        hospital['hospital']['rank']=1
        return [hospital['hospital']]
    
    raw_matrix = np.array([
        [
            h['raw_scores']['emergency_match'],
            h['raw_scores']['icu_availability'],
            1 - (h['raw_scores']['current_load'] / 10),
            1 - (min(h['raw_scores']['distance'], 30000) / 30000)
        ]
        for h in scored_hospitals
    ])

    scaler = MinMaxScaler()
    if raw_matrix.shape[0] > 1:
        normalized = scaler.fit_transform(raw_matrix)
    else:
        normalized = raw_matrix
    
    final_scores = normalized @ np.array([
        WEIGHTS['emergency_match'],
        WEIGHTS['icu_availability'],
        WEIGHTS['current_load'],
        WEIGHTS['distance']
    ])

    results=[]
    for i, scored in enumerate(scored_hospitals):
        hospital = scored['hospital']
        hospital['hlers_score'] = round(float(final_scores[i]) *100, 1)
        results.append(hospital)

    results.sort(key= lambda x: x['hlers_score'], reverse=True)

    for i, hospital in enumerate(results):
        hospital['rank'] = i + 1
    
    return results

def get_recommendations(hospitals, emergency_type):
    if not hospitals or not emergency_type:
        return []

    scored = score_hospitals(hospitals, emergency_type)
    ranked = normalize_and_rank(scored)

    return ranked


if __name__ == '__main__':
    test_hospitals = [
        {
            'name': 'Ruby Hall Clinic',
            'emergencyTypes': ['cardiac', 'trauma', 'stroke', 'respiratory'],
            'availableICUBeds': 8,
            'totalICUBeds': 20,
            'currentLoad': 5,
            'emergencyDeptOpen': True,
            'specialists': [
                {'type': 'cardiologist', 'available': True},
                {'type': 'trauma surgeon', 'available': True},
                {'type': 'pulmonologist', 'available': True}
            ],
            'distanceMeters': 5200
        },
        {
            'name': 'Deenanath Mangeshkar Hospital',
            'emergencyTypes': ['cardiac', 'stroke', 'general'],
            'availableICUBeds': 3,
            'totalICUBeds': 30,
            'currentLoad': 9,
            'emergencyDeptOpen': True,
            'specialists': [
                {'type': 'neurologist', 'available': True},
                {'type': 'cardiologist', 'available': False}
            ],
            'distanceMeters': 4100
        },
        {
            'name': 'Sassoon General Hospital',
            'emergencyTypes': ['cardiac', 'trauma', 'burns', 'stroke', 'general'],
            'availableICUBeds': 15,
            'totalICUBeds': 50,
            'currentLoad': 6,
            'emergencyDeptOpen': True,
            'specialists': [
                {'type': 'cardiologist', 'available': True},
                {'type': 'trauma surgeon', 'available': False},
                {'type': 'neurologist', 'available': True}
            ],
            'distanceMeters': 3300
        }
    ]

    results = get_recommendations(test_hospitals, 'cardiac')

    print('\nHLERS ML Recommendations')
    for hospital in results:
        print(f"#{hospital['rank']} {hospital['name']} — Score: {hospital['hlers_score']}")
    print('\n')
