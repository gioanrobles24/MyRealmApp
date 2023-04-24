/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import {Realm, createRealmContext} from '@realm/react';
class Task extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  description!: string;
  isComplete!: boolean;
  createdAt!: Date;

  static generate(description: string) {
    return {
      _id: new Realm.BSON.ObjectId(),
      description,
      createdAt: new Date(),
    };
  }

  static schema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      description: 'string',
      isComplete: {type: 'bool', default: false},
      createdAt: 'date',
    },
  };
}

const {RealmProvider, useRealm, useQuery} = createRealmContext({
  schema: [Task],
});

export default function AppWrapper() {
  return (
    <RealmProvider>
      <TaskApp />
    </RealmProvider>
  );
}

function TaskApp() {
  const realm = useRealm();
  const tasks = useQuery(Task);
  const [newDescription, setNewDescription] = useState('');
  const [descriptionToEdit, setEditDescription] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const changeProfileName = (profile: Task, editDescription: string) => {
    realm.write(() => {
      profile.description = editDescription;
    });
    setEditDescription('');
  };
  return (
    <SafeAreaView>
      <View
        style={{flexDirection: 'row', justifyContent: 'center', margin: 10}}>
        <TextInput
          value={newDescription}
          placeholder="Enter new task description"
          onChangeText={setNewDescription}
        />
        <Pressable
          onPress={() => {
            realm.write(() => {
              realm.create('Task', Task.generate(newDescription));
            });
            setNewDescription('');
          }}>
          <Text>➕</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks?.sorted('createdAt')}
        keyExtractor={item => item._id.toHexString()}
        renderItem={({item}) => {
          return (
            <>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 10,
                  borderWidth: 2,
                  borderColor: 'green',
                }}>
                <Text
                  style={{
                    paddingHorizontal: 10,
                    borderColor: 'blue',
                    borderWidth: 2,
                    marginHorizontal: 10,
                  }}>
                  description: {item.description}
                </Text>
                <TextInput
                  style={{
                    paddingHorizontal: 10,
                    borderColor: 'yellow',
                    borderWidth: 2,
                    margin: 10,
                  }}
                  onFocus={() => setSelectedItem(item._id.toHexString())}
                  value={
                    selectedItem === item._id.toHexString()
                      ? descriptionToEdit
                      : ''
                  }
                  placeholder="Enter description to edit"
                  onChangeText={
                    selectedItem === item._id.toHexString()
                      ? setEditDescription
                      : () => null
                  }
                />
                <Pressable
                  onPress={() => changeProfileName(item, descriptionToEdit)}>
                  <Text
                    style={{
                      paddingHorizontal: 10,
                      borderColor: 'yellow',
                      borderWidth: 2,
                      margin: 10,
                    }}>
                    Guardar cambios
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    realm.write(() => {
                      realm.delete(item);
                    });
                  }}>
                  <Text>Borrar {'🗑️'}</Text>
                </Pressable>
              </View>
            </>
          );
        }}
      />
    </SafeAreaView>
  );
}
