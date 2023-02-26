import { useState } from 'react';
import { IS_OLD_GAME_UI_ENABLED } from '../../app/config';
import { testCaseNames } from '../../shared/tests/testCaseNames';
import styles from './RoomForm.m.scss';

export const RoomForm = ({ title, onSubmit, onCancel }: IRoomFormProps) => {
  const [oldGameUI, setOldGameUI] = useState(false);
  const [testCaseName, setTestCaseName] = useState('');

  const actionText = title.toLowerCase().includes('join') ? 'Join' : 'Create';

  const handleChangeTestName = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTestCaseName(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(testCaseName, oldGameUI);
  };

  return (
    <div className={styles.form}>
      <div className={styles.fromBody}>
        <h2 className="heading">{title}</h2>
        {IS_OLD_GAME_UI_ENABLED && (
          <>
            <label className={styles.oldUI}>
              Old UI:
              <input
                type="checkbox"
                checked={oldGameUI}
                onChange={() => setOldGameUI(!oldGameUI)}
              />
            </label>
            {actionText === 'Create' && (
              <>
                <label className={styles.oldUI}>
                  <select
                    style={{ height: '34px', background: 'rgba(0, 0, 0, 0.5)' }}
                    name="testNames"
                    value={testCaseName}
                    onChange={handleChangeTestName}
                  >
                    <option value="">No testCase</option>
                    {testCaseNames.map((testCaseName) => (
                      <option
                        key={testCaseName}
                        value={testCaseName}
                      >
                        {testCaseName}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </>
        )}
      </div>
      <div className={styles.formFooter}>
        <button
          onClick={handleSubmit}
          className="btn"
          type="button"
        >
          {actionText}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export declare interface IRoomFormProps {
  title: string;
  onSubmit(testCaseName: string, oldGameUI: boolean): void;
  onCancel(): void;
}
