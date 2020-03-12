import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Radio, Checkbox } from 'antd';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';

import { getUserInfoByLoginName, getUserRole } from '@/actions/admin';
import ContentBox from '@/components/ContentBox';
//数据转字典标题
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split } from '@/utils';
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary } from '@/utils/componentExt';

const CheckboxGroup = Checkbox.Group
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
const RadioGroup = Radio.Group
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class UserView extends React.Component {
    constructor(props) {
        super(props)
        this.loadBizDictionary = loadBizDictionary.bind(this);
        let roles = [];
        if (props.currentDataModel.roleId) {
            let roleIds = split(props.currentDataModel.roleId);
            let roleNames = split(props.currentDataModel.roleName);
            roleIds.map((a, index) => {
                roles.push({ label: roleNames[index], key: a });
            });
        }
        props.currentDataModel.dataPower = {};
        this.state = {
            liveOnff:true,
            isAdmin: true,
            dataModel: props.currentDataModel,//数据模型
            roles: roles,
            dic_DataPowers: [{ title: '仅个人创建', value: '1' }, { title: '全局 （区域）', value: '0' }],
            dic_DataPowers2: [{ title: '仅个人创建', value: '1' }, { title: '全局 （分部）', value: '0' }],
            all_roles: props.dic_Roles || []
        };
    }

    componentWillMount() {
        //载入需要的字典项
        this.loadBizDictionary(['branch_type']);

        if (this.props.editMode == 'Power' || this.props.editMode == 'View') {
            this.setState({ findUser: true });
            //加载最新信息
            this.props.getUserRole(this.state.dataModel.userId).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    message.error(data.message);
                }
                else {
                    let { dataModel } = this.state;
                    let { roleList, adminUser, isAdmin } = data.data;
                    roleList = roleList || [];
                    adminUser = adminUser || {};//{ isSelfOrder: 0, isSelfStudent: 0, isSelfQuickPay: 0 }
                    dataModel.roleId = roleList.map(a => a.roleId).join(',');
                    dataModel.dataPower = adminUser;

                    let roleArr = [];
                    roleList.map((item) => {
                        let obj = {};
                        obj.key = item.roleId.toString();
                        this.state.all_roles.map((list) => {
                            if(item.roleId == list.value){
                                item.roleName = list.title;
                                obj.label = list.title;
                            }
                        }) 
                        roleArr.push(obj);
                    })

                    this.setState({
                        roles: roleArr,
                        isAdmin: isAdmin
                    })
                    
                    this.setState({ dataModel }, () => {
                        this.props.form.resetFields(['isSelfOrder', 'isSelfStudent', 'isSelfQuickPay'])
                    })
                }
            });
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.changeEeqError(); 
                if (values.scopeTypes) {
                    values.scopeTypes = values.scopeTypes.join(',');
                }
                this.setState({ loading: true,liveOnff:true });
                // setTimeout(() => {
                //     this.setState({ loading: false });
                // }, 3000);//合并保存数据

                if(this.props.editMode == 'Power'){

                    let formRoleIds = [];

                    values.formRoleIds.map((item) => {
                        formRoleIds.push(item.key);
                    })

                    values.formRoleIds = formRoleIds;
                }
                
                this.props.viewCallback({ ...this.state.dataModel, ...values, roleIds: values.formRoleIds });//合并保存数据
            }
        });
    }
    componentWillReceiveProps(props){  
        if(props.reqErroe){ 
          this.setState({
              loading:false,
              liveOnff:false, 
          })
        }
      } 
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode, '授权');
        return `${op}用户`;
    }

    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                {this.state.findUser ? <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '授权')}</Button> : <Button type="primary" disabled icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode, '授权')}</Button>}<span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>

            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }

    onSearchUserInfo = (e) => {
        this.props.getUserInfoByLoginName(e.target.value).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.result === false) {
                this.setState({ findUser: false });
                message.warn('没有找到对应用户!')
            }
            else {
                message.info('找到对应用户')
                this.state.dataModel = { ...this.state.dataModel, ...data.data };//属性合并
                this.setState({ findUser: true, dataModel: this.state.dataModel });
            }
        })
    }
    getTearchList = (value) => {

        let searchList = this.props.dic_Roles.filter( a => a.title.indexOf(value) > -1 );
        
        this.setState({
            all_roles: searchList,
        })
            
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
            case "Power":
                {
                    
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                {//添加模式下
                                    this.props.editMode == 'Create' && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="工号"
                                            extra="请您输入工号查找用户信息"
                                        >
                                            {getFieldDecorator('loginName', {
                                                initialValue: this.state.dataModel.loginName,
                                                rules: [
                                                    {
                                                        required: true, message: '请输入工号!',
                                                    }],
                                            })(
                                                <Input onChange={(e) => { this.setState({ loginName: e.target.value }) }}
                                                    placeholder="请输入工号"
                                                    onBlur={this.onSearchUserInfo}
                                                />
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Create') && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="授权角色"
                                            extra="支持勾选择多个角色"
                                        >
                                            {getFieldDecorator('formRoleIds', {
                                                initialValue: [],
                                                rules: [{
                                                    required: true, message: '请选择角色!',
                                                }],
                                            })(
                                                <Select
                                                    mode="multiple" >
                                                    {this.props.dic_Roles.map((item, index) => {
                                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Create' && this.props.currentUser.userType.usertype == 1) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="负责分部类型"
                                        //extra="如果不勾选，则用户没有任何分部数据权限"
                                        >
                                            {getFieldDecorator('scopeTypes', {
                                                initialValue: [],
                                                rules: [{
                                                    required: true, message: '至少选择一个负责分部类型!',
                                                }],
                                            })(
                                                <CheckboxGroup>
                                                    {
                                                        this.state.branch_type.map((item, index) => {
                                                            return <Checkbox value={item.value} key={index}>{item.title}</Checkbox>
                                                        })
                                                    }
                                                </CheckboxGroup>
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                                {//授权模式下
                                    this.props.editMode != 'Create' && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="工号"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.loginName}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="姓名"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.realName}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="证件号"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.certificateNo}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="部门"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.department}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="手机"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.mobile}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="办公电话"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.otherPhone}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="邮箱"
                                        >
                                            <span className="ant-form-text">{this.state.dataModel.email}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' || this.state.findUser) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="状态"
                                        >
                                            <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.state)}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power') && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="授权角色"
                                            extra="支持勾选择多个角色"
                                        >
                                            {getFieldDecorator('formRoleIds', {
                                                initialValue: this.state.roles.length ? this.state.roles : [],
                                                rules: [{
                                                    required: !this.state.isAdmin, message: '请选择角色!',
                                                }],
                                            })(
                                                <Select
                                                    mode="multiple"
                                                    labelInValue
                                                    placeholder="请按模糊搜索"
                                                    filterOption={false}
                                                    onSearch={this.getTearchList}
                                                    // onChange={this.handleChange}
                                                >
                                                    {this.state.all_roles.map((item, index) => {
                                                        // if (this.state.roles.find(a => a.value == item.value)) {
                                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                                        // }
                                                        
                                                    })}
                                                </Select>
                                                )}
                                        </FormItem>
                                    </Col>
                                }{
                                    (this.props.editMode == 'Power' && this.props.currentUser.userType.usertype == 3) && <Col span={24}>
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            label="订单管理范围"
                                        >
                                            {getFieldDecorator('isSelfOrder', {
                                                initialValue: dataBind(this.state.dataModel.dataPower.isSelfOrder),
                                                rules: [{
                                                    required: false, message: '请选择订单管理范围!',
                                                }],
                                            })(
                                                <RadioGroup>
                                                    {this.state.dic_DataPowers.map((item, index) => {
                                                        return <Radio value={item.value}>{item.title}</Radio>
                                                    })}
                                                </RadioGroup>
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.props.currentUser.userType.usertype == 3) && <Col span={24}>
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            label="学生管理范围"
                                        >
                                            {getFieldDecorator('isSelfStudent', {
                                                initialValue: dataBind(this.state.dataModel.dataPower.isSelfStudent),
                                                rules: [{
                                                    required: false, message: '请选择学生管理范围!',
                                                }],
                                            })(
                                                <RadioGroup>
                                                    {this.state.dic_DataPowers.map((item, index) => {
                                                        return <Radio value={item.value}>{item.title}</Radio>
                                                    })}
                                                </RadioGroup>
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.editMode == 'Power' && this.props.currentUser.userType.usertype == 3) && <Col span={24}>
                                        <FormItem
                                            {...searchFormItemLayout24}
                                            label="快捷支付管理范围"
                                        >
                                            {getFieldDecorator('isSelfQuickPay', {
                                                initialValue: dataBind(this.state.dataModel.dataPower.isSelfQuickPay),
                                                rules: [{
                                                    required: false, message: '请选择快捷支付管理范围!',
                                                }],
                                            })(
                                                <RadioGroup>
                                                    {this.state.dic_DataPowers2.map((item, index) => {
                                                        return <Radio value={item.value}>{item.title}</Radio>
                                                    })}
                                                </RadioGroup>
                                                )}
                                        </FormItem>
                                    </Col>
                                }
                            </Row>
                        </Form >
                    )
                }
                break;
            case "View":
            case "Delete":
                {
                    block_content = (
                        <Form layout="Vertical">
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="工号"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.loginName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="姓名"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.realName}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="证件号"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.certificateNo}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="部门"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.department}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="手机"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.mobile}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="办公电话"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.otherPhone}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="邮箱"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.email}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="状态"
                                    >
                                        <span className="ant-form-text">{getDictionaryTitle(this.props.dic_Status, this.state.dataModel.state)}</span>
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem
                                        {...searchFormItemLayout}
                                        label="授权角色"
                                    >
                                        <span className="ant-form-text">{this.state.dataModel.roleName}</span>
                                    </FormItem>
                                </Col>
                                {
                                    (this.props.currentUser.userType.usertype == 3) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="订单管理范围"
                                        >
                                            <span className="ant-form-text">{getDictionaryTitle(this.state.dic_DataPowers, this.state.dataModel.dataPower.isSelfOrder, '未设置')}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.currentUser.userType.usertype == 3) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="学生管理范围"
                                        >
                                            <span className="ant-form-text">{getDictionaryTitle(this.state.dic_DataPowers, this.state.dataModel.dataPower.isSelfStudent, '未设置')}</span>
                                        </FormItem>
                                    </Col>
                                }
                                {
                                    (this.props.currentUser.userType.usertype == 3) && <Col span={12}>
                                        <FormItem
                                            {...searchFormItemLayout}
                                            label="快捷支付管理范围"
                                        >
                                            <span className="ant-form-text">{getDictionaryTitle(this.state.dic_DataPowers2, this.state.dataModel.dataPower.isSelfQuickPay, '未设置')}</span>
                                        </FormItem>
                                    </Col>
                                }
                            </Row>
                            {/* {this.renderBtnControl()} */}
                        </Form>
                    );
                }
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        let block_editModeView = this.renderEditModeOfView();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedUserView = Form.create()(UserView);

const mapStateToProps = (state) => {
    let { currentUser } = state.auth;
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getUserRole: bindActionCreators(getUserRole, dispatch),
        getUserInfoByLoginName: bindActionCreators(getUserInfoByLoginName, dispatch),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedUserView);
